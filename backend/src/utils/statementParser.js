export function generateTransactionsCSV(transactions) {
  const headers = ['Data', 'Tipo', 'Descricao', 'Categoria', 'Conta', 'Valor', 'Parcela', 'Observacoes'];
  const escape = (val) => {
    if (val === null || val === undefined) return '';
    const str = String(val).replace(/"/g, '""');
    return `"${str}"`;
  };

  const rows = transactions.map((t) => {
    const dateStr = new Date(t.date).toISOString().split('T')[0];
    const tipo = t.type === 'INCOME' ? 'Receita' : 'Despesa';
    const parcela = t.installmentTotal ? `${t.installmentNumber}/${t.installmentTotal}` : '';
    return [
      escape(dateStr),
      escape(tipo),
      escape(t.description),
      escape(t.categoryRel?.name || t.category),
      escape(t.account?.name || 'Sem conta'),
      escape(Number(t.amount).toFixed(2).replace('.', ',')),
      escape(parcela),
      escape(t.notes || ''),
    ].join(';');
  });

  return '\uFEFF' + [headers.join(';'), ...rows].join('\n');
}

export function parseStatementContent(content, filename = '') {
  const lower = filename.toLowerCase();
  if (lower.endsWith('.ofx') || content.includes('<OFX>') || content.includes('<STMTTRN>')) {
    return parseOFX(content);
  }
  return parseCSV(content);
}

function parseOFX(content) {
  const blocks = content.split('<STMTTRN>').slice(1);
  const items = [];

  for (const block of blocks) {
    const endIdx = block.indexOf('</STMTTRN>');
    const chunk = endIdx !== -1 ? block.slice(0, endIdx) : block;

    const extractTag = (tag) => {
      const regex = new RegExp(`<${tag}>([^<\\r\\n]+)`, 'i');
      const match = chunk.match(regex);
      return match ? match[1].trim() : null;
    };

    const rawAmount = parseFloat((extractTag('TRNAMT') || '0').replace(',', '.'));
    if (!rawAmount || Number.isNaN(rawAmount)) continue;

    const dtPosted = extractTag('DTPOSTED') || '';
    let parsedDate = new Date();
    if (dtPosted.length >= 8) {
      const y = dtPosted.slice(0, 4);
      const m = dtPosted.slice(4, 6);
      const d = dtPosted.slice(6, 8);
      parsedDate = new Date(`${y}-${m}-${d}T12:00:00.000Z`);
    }

    const memo = extractTag('MEMO') || extractTag('NAME') || 'Lançamento OFX';

    items.push({
      type: rawAmount >= 0 ? 'INCOME' : 'EXPENSE',
      amount: Math.abs(rawAmount),
      description: memo.slice(0, 120),
      date: parsedDate.toISOString(),
      category: rawAmount >= 0 ? 'Receita Importada' : 'Despesa Importada',
    });
  }

  return items;
}

function parseCSV(content) {
  const clean = content.replace(/^\uFEFF/, '').trim();
  const lines = clean.split(/\r?\n/).filter((l) => l.trim().length > 0);
  if (lines.length < 2) return [];

  const delimiter = lines[0].includes(';') ? ';' : ',';
  const splitRow = (line) => {
    const result = [];
    let current = '';
    let inQuotes = false;
    for (let i = 0; i < line.length; i++) {
      const char = line[i];
      if (char === '"') {
        inQuotes = !inQuotes;
      } else if (char === delimiter && !inQuotes) {
        result.push(current.trim());
        current = '';
      } else {
        current += char;
      }
    }
    result.push(current.trim());
    return result;
  };

  const headers = splitRow(lines[0]).map((h) => h.toLowerCase());
  const dateIdx = headers.findIndex((h) => h.includes('data') || h.includes('date'));
  const descIdx = headers.findIndex((h) => h.includes('desc') || h.includes('hist') || h.includes('memo'));
  const valIdx = headers.findIndex((h) => h.includes('valor') || h.includes('amount') || h.includes('quantia'));
  const typeIdx = headers.findIndex((h) => h.includes('tipo') || h.includes('type'));
  const catIdx = headers.findIndex((h) => h.includes('categ'));

  const items = [];
  for (let i = 1; i < lines.length; i++) {
    const cols = splitRow(lines[i]);
    if (cols.length < 2) continue;

    const rawValStr = (cols[valIdx !== -1 ? valIdx : cols.length - 1] || '0')
      .replace(/[R$\s]/g, '')
      .replace(/\.(?=\d{3})/g, '')
      .replace(',', '.');
    const numVal = parseFloat(rawValStr);
    if (!numVal || Number.isNaN(numVal)) continue;

    let type = numVal >= 0 ? 'INCOME' : 'EXPENSE';
    if (typeIdx !== -1 && cols[typeIdx]) {
      const tLower = cols[typeIdx].toLowerCase();
      if (tLower.includes('desp') || tLower.includes('exp') || tLower.includes('deb')) type = 'EXPENSE';
      if (tLower.includes('rec') || tLower.includes('inc') || tLower.includes('cred')) type = 'INCOME';
    }

    const rawDate = dateIdx !== -1 ? cols[dateIdx] : '';
    let parsedDate = new Date();
    if (/^\d{2}\/\d{2}\/\d{4}$/.test(rawDate)) {
      const [d, m, y] = rawDate.split('/');
      parsedDate = new Date(`${y}-${m}-${d}T12:00:00.000Z`);
    } else if (/^\d{4}-\d{2}-\d{2}/.test(rawDate)) {
      parsedDate = new Date(`${rawDate.slice(0, 10)}T12:00:00.000Z`);
    }

    items.push({
      type,
      amount: Math.abs(numVal),
      description: (descIdx !== -1 ? cols[descIdx] : 'Transação CSV').slice(0, 120),
      date: parsedDate.toISOString(),
      category: catIdx !== -1 && cols[catIdx] ? cols[catIdx] : 'Outros',
    });
  }

  return items;
}
