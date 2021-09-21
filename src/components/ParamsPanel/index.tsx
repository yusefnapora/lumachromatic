import React from 'react'
import { Formik, Form, Field } from 'formik'
import styles from './styles.css'

import type { HarmonicParams } from '../../types'


const SCALE_TYPES = ['major', 'minor', 'harmonic minor', 'melodic minor', 'augmented', 'diminished', 'blues', 'major blues', 'major pentatonic', 'minor pentatonic', 'chromatic']
const NOTES = ['C', 'C#', 'D', 'D#', 'E', 'F', 'F#', 'G', 'G#', 'A', 'A#', 'B']

interface Props {
  onChange?(values: HarmonicParams): void
}

export default function ParamsPanel(props: Props): React.ReactElement {
  return (
    <div className={styles.ParamsPanel} >
      <Formik 
        initialValues={{
          tonicNote: 'C',
          scaleName: 'major'
        }}

        onSubmit={(values) => {
          props.onChange && props.onChange(values)
        }}
      >
        {({submitForm, handleChange}) =>
          <Form>
            <label htmlFor="tonic-input">Tonic Note</label>
            <Field id="tonic-input" as="select" name="tonicNote" onChange={(e: React.ChangeEvent) => { handleChange(e); submitForm() }} >
              {NOTES.map(n => <option key={n} value={n}>{n}</option>)}
            </Field>

            <label htmlFor="scale-type-select">Scale type</label>
            <Field id="scale-type-select" as="select" name="scaleName" onChange={(e: React.ChangeEvent) => { handleChange(e); submitForm() }} >
              {SCALE_TYPES.map(t => <option key={t} value={t}>{t}</option>)}
            </Field>
          </Form>
        }
      </Formik>
    </div>
  )
}