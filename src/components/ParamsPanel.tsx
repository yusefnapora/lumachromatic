import React from 'react'
import { Formik, Form, Field } from 'formik'

export default function ParamsPanel(): React.ReactElement {
  return (
    <div>
      <Formik 
        initialValues={{
          tonic: "C",
        }}

        onSubmit={(values) => {
          console.log(values)
        }}
      >
        <Form>
          <label htmlFor="tonic-input">Tonic Note</label>
          <Field id="tonic-input" type="input" name="tonic" />
        </Form>
      </Formik>
    </div>
  )
}