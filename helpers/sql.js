"use strict";

const { BadRequestError } = require("../expressError");

/** Takes in dataToUpdate ->
 * an user object :
 *  {"firstName" : "Banana", color: "yellow"...}
 *
 * and takes in jsToSQL ->
 * An object with key that is in js camelcase that needs to be changed to
 * the corresponding database column.
 *  {
      firstName: "first_name",
    }
 *
 * Return information from dataToUpdate in a way that can be used in
 * SQL language's SET clause in an UPDATE statement:
 *
 * Returns:
 *  { setCols : `"first_name"=$1, "color"=$2`,
 *    values :['Banana', 'yellow']
 *  } */

function sqlForPartialUpdate(dataToUpdate, jsToSql) {
  const keys = Object.keys(dataToUpdate);
  if (keys.length === 0) throw new BadRequestError("No data");

  // {firstName: 'Aliya', age: 32} => ['"first_name"=$1', '"age"=$2']
  const cols = keys.map((colName, idx) =>
    `"${jsToSql[colName] || colName}"=$${idx + 1}`,
  );

  return {
    setCols: cols.join(", "),
    values: Object.values(dataToUpdate),
  };
}

/**
 * takes in object of filter params such as companyName, minEmployees,
 *
 * maxEmployees, as well as obj of keys: js, values: sql columns
 *  //FIXME:  Add examples
 *  returns object of clause: sql where clause,
 *  values: array of search criteria
 */

function sqlForWhereClause(filterParams, jsToSql) {

  const keys = Object.keys(filterParams);
  let clause = keys.map((whereName, idx) =>
    `${jsToSql[whereName] || whereName} $${idx + 1}`,
  );

  clause = "WHERE " + clause.join(" AND ");
  let values = Object.values(filterParams);

  for (let i = 0; i < values.length; i++) {
    if (typeof (values[i]) === "string") {
      values[i] = `%${values[i]}%`;
      //FIXME: if the value:jsToSql has Like or ILike before then add the '%%'
    }
  }

  return { clause, values };
}




module.exports = { sqlForPartialUpdate, sqlForWhereClause };