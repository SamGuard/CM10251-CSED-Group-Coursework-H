import React, { useState } from "react";
import {OverlayTrigger, Tooltip, Button, FormGroup, FormControl, ControlLabel } from "react-bootstrap";
import "./Login.css";

export default function Login(props) {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");

  function validateForm() {
    return validateEmail() && validatePassword();
  }

  function validateEmail() {
    var pattern = /[a-z0-9!#$%&'*+/=?^_`{|}~-]+(?:\.[a-z0-9!#$%&'*+/=?^_`{|}~-]+)*@(?:[a-z0-9](?:[a-z0-9-]*[a-z0-9])?\.)+[a-z0-9](?:[a-z0-9-]*[a-z0-9])?/i;
    return pattern.test(email)
  }

  function validatePassword() {
    return password.length >= 8;
  }

  function handleSubmit(event) {
    event.preventDefault();
  }

  return (
    <div className="Login">
      <form onSubmit={handleSubmit}>
        <FormGroup controlId="email" bsSize="large">
          <ControlLabel>Email: </ControlLabel>
          <OverlayTrigger
            key="right"
            placement="right"
            overlay={
              <Tooltip id={`tooltip-right`}>
                Emails must be of the form <strong>example@example.example</strong>
              </Tooltip>
            }
            >
              <FormControl
                autoFocus
                type="email"
                value={email}
                onChange={e => setEmail(e.target.value)}
                id="emailInput"
              />
            </OverlayTrigger>
          </FormGroup>

          <FormGroup id="passwordInput" controlId="password" bsSize="large">
            <ControlLabel>Password: </ControlLabel>
            <OverlayTrigger
              key="right"
              placement="right"
              overlay={
                <Tooltip id={`tooltip-right`}>
                  Passwords must be a minimum of <strong>8</strong> characters.
                </Tooltip>
              }
              >
                <FormControl
                  value={password}
                  onChange={e => setPassword(e.target.value)}
                  type="password"
                />
              </OverlayTrigger>
            </FormGroup>

            <Button block bsSize="large" disabled={!validateForm()} type="submit">
              Login
            </Button>
          </form>
        </div>
      );
    }
