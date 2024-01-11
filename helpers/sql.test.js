'use strict';

const { BadRequestError } = require("../expressError");
const { sqlForPartialUpdate, sqlForWhereClause } = require('./sql');

// positive test
// firstName, lastName, isAdmin, email -> first_name, last_name, is_admin, email
//'"first_name"=$1, "last_name"=$2, "email"=$3, "is_admin"=$4'

//negative tests
// throws error if there is no input

describe('testing sqlForPartialUpdate', function () {

  test('keys translate to column names', function () {
    const result = sqlForPartialUpdate(
      {
        firstName: "John",
        lastName: "Doe",
        email: "email@email.com",
        isAdmin: "false"
      },
      {
        firstName: "first_name",
        lastName: "last_name",
        isAdmin: "is_admin"
      });

    expect(result).toEqual({
      setCols: '"first_name"=$1, "last_name"=$2, "email"=$3, "is_admin"=$4',
      values: ["John", "Doe", "email@email.com", "false"]
    });

  });

  test('functioned called without input', function () {
    let error;
    try {
      sqlForPartialUpdate({}, {});
    } catch (err) {
      console.log('*** err', err.stack);
      error = err.stack;
    }
    expect(error).toContain("No data");
  });
});

describe('testing sqlForWhereClause', function () {

  test('turns search params into WHERE clause', function () {
    const jsToSql = {
      companyName: "name ILIKE",
      minEmployees: "num_employees >=",
      maxEmployees: "num_employees <="
    };

    const searchParams = {
      "minEmployees": "234",
      "maxEmployees": "300"
    };


    const result = sqlForWhereClause(searchParams, jsToSql);

    expect(Object.values(result)[0]).toContain(
      "num_employees >= $1 AND num_employees <= $2"
    );

  });
})

