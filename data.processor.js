function rowsToObjects(rows) {
  const headers = rows[0];

  return rows.slice(1).map(row => {
    const obj = {};
    headers.forEach((header, i) => {
      obj[header] = row[i];
    });
    return obj;
  });
}

module.exports = { rowsToObjects };
