'use strict';

const { BadRequestError } = require("../expressError");
const { sqlForPartialUpdate } = require('./sql');



// positive test
// firstName, lastName, isAdmin, email -> first_name, last_name, is_admin, email
//'"first_name"=$1, "last_name"=$2, "email"=$3, "is_admin"=$4'
//
// test -> camel case turns to column name
// firstName = first_name, lastName = last_name, isAdmin = is_admin
// test ->
//

//negative tests
// throws error if no

describe('testing sqlForPartialUPdate', function() {

  test('keys translate to column names', function() {
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
      })

      expect(result).toEqual({
        setCols: '"first_name"=$1, "last_name"=$2, "email"=$3, "is_admin"=$4',
        values: ["John", "Doe", "email@email.com", "false"]
      })

  })

  test('functioned called without input', function () {
    const result = sqlForPartialUpdate({},{});
    expect(result).toThrow(BadRequestError);
  })
})
