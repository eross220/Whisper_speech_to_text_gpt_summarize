import React, { Component } from 'react';
import logo from './logo.svg';
import './App.css';
import 'bootstrap/dist/css/bootstrap.min.css';
import { Button, Form} from'react-bootstrap';

function App( ){
    return (
      <div>
        <Form>
          <Form.Group className="mb-3" controlId="formBasicEmail">
            <Form.Label>Label1</Form.Label>
            <Form.Control type="text" placeholder="label1" />

            <Form.Label>Label2</Form.Label>
            <Form.Control type="text" placeholder="label2" />

            <Form.Label>Label3</Form.Label>
            <Form.Control type="text" placeholder="label3" />

            <Form.Control type="text" placeholder="label4" />
            <Form.Label>Label4</Form.Label>


            <Button variant="primary">
              Submit
            </Button>

            <Form.Text placeholder="Text1"/>

            <Button variant="primary" type="submit">
              Submit
            </Button>
            <Form.Text placeholder="Text2"/>
          </Form.Group>
        </Form>
      </div>
    );
}

export default App;
