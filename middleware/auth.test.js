"use strict";

const jwt = require("jsonwebtoken");
const { UnauthorizedError } = require("../expressError");
const {
  authenticateJWT,
  ensureLoggedIn,
  isAdmin,
  ensureUserOrAdmin,
} = require("./auth");


const { SECRET_KEY } = require("../config");
const testJwt = jwt.sign({ username: "test", isAdmin: false }, SECRET_KEY);
const badJwt = jwt.sign({ username: "test", isAdmin: false }, "wrong");

function next(err) {
  if (err) throw new Error("Got error from middleware");
}


describe("authenticateJWT", function () {
  test("works: via header", function () {
    const req = { headers: { authorization: `Bearer ${testJwt}` } };
    const res = { locals: {} };
    authenticateJWT(req, res, next);
    expect(res.locals).toEqual({
      user: {
        iat: expect.any(Number),
        username: "test",
        isAdmin: false,
      },
    });
  });

  test("works: no header", function () {
    const req = {};
    const res = { locals: {} };
    authenticateJWT(req, res, next);
    expect(res.locals).toEqual({});
  });

  test("works: invalid token", function () {
    const req = { headers: { authorization: `Bearer ${badJwt}` } };
    const res = { locals: {} };
    authenticateJWT(req, res, next);
    expect(res.locals).toEqual({});
  });
});


describe("ensureLoggedIn", function () {
  test("works", function () {
    const req = {};
    const res = { locals: { user: { username: "test" } } };
    ensureLoggedIn(req, res, next);
  });

  test("unauth if no login", function () {
    const req = {};
    const res = { locals: {} };
    expect(() => ensureLoggedIn(req, res, next))
        .toThrow(UnauthorizedError);
  });

  test("unauth if no valid login", function () {
    const req = {};
    const res = { locals: { user: { } } };
    expect(() => ensureLoggedIn(req, res, next))
        .toThrow(UnauthorizedError);
  });

});


describe("isAdmin", function() {

  test("works", function() {
    const req = {};
    const res = { locals: { user: { username: "test", isAdmin: true } } };
    isAdmin(req, res, next);
  });

  test("unauth if not admin", function() {
    const req = {};
    const res = { locals: { user: { username: "test", isAdmin: false} } };
    expect(() => isAdmin(req, res, next))
      .toThrow(UnauthorizedError);
  });


  test("unauth if no login", function () {
    const req = {};
    const res = { locals: {} };
    expect(() => isAdmin(req, res, next))
        .toThrow(UnauthorizedError);
  });

  test("unauth if no valid login", function () {
    const req = {};
    const res = { locals: { user: { } } };
    expect(() => isAdmin(req, res, next))
        .toThrow(UnauthorizedError);
  });

  test("ensure isAdmin doesn't work with string", function() {
    const req = {};
    const res = {locals: { user: { username: "test", isAdmin: "true"} } };
    expect(() => isAdmin(req, res, next))
        .toThrow(UnauthorizedError);
  });
});

describe("ensureUserOrAdmin", function() {
  // works: if they are admin
  // works: if username matches current user
  // works: if admin editing other user's page
  //  unauth: if not admin but logged in user editing someone else's page
  // unauth: if username doesn't match current user
  // unauth: if you are not logged in
  test("works: admin", function() {
    const req = {params: {username: "test"}};
    const res = {locals: {user: { username: "test", isAdmin: true} } };
    expect(() => ensureUserOrAdmin(req, res, next));
  });

  test ("works: admin edit/delete other user", function() {
    const req = {params: {username: "test1"}};
    const res = {locals: {user: {username: "test", isAdmin: true} } };
    expect(() => ensureUserOrAdmin(req, res, next));
  });

  test("works: logged in username matches params username", function() {
    const req = {params: {username: "test"}};
    const res = {locals: {user: {username: "test"} } };
    expect(() => ensureUserOrAdmin(req, res, next))
  });

  test("unauth if non-admin user edit/delete other user", function() {
    const req = {params: {username: "bad"}};
    const res = {locals: {user: {username: "test", isAdmin: false} } };
    expect(() => ensureUserOrAdmin(req, res, next))
        .toThrow(UnauthorizedError);
  });

  test("unauth if username doesn't match current local user", function() {
    const req = {params: {username: "test1"}};
    const res = {locals: {user: {username: "test"} } };
    expect(() => ensureUserOrAdmin(req, res, next))
        .toThrow(UnauthorizedError);
  });

  test("unauth if anon", function() {
    const req = {params: {username: "test"}};
    const res = {locals: {}};
    expect(() => ensureUserOrAdmin(req, res, next))
        .toThrow(UnauthorizedError);
  });
})