import React from 'react';
import PropTypes from 'prop-types';

import Header from "./Header";
import Show from "./Show";
import Empty from "./Empty";
import Form from "./Form";
import Status from "./Status";
import Confirm from "./Confirm";
import Error from "./Error";
import useVisualMode from "../../hooks/useVisualMode";

import "./styles.scss";

//variables needed for the visual mode hook
const EMPTY = "EMPTY";
const SHOW = "SHOW";
const CREATE = "CREATE";
const SAVING = "SAVING";
const DELETING = "DELETING";
const CONFIRM = "CONFIRM";
const EDIT = "EDIT";
const ERROR_SAVE = "ERROR_SAVE";
const ERROR_DELETE = "ERROR_DELETE";

function Appointment(props) {

  //set the initial mode conditionally based on props.interview value
  const { mode, transition, back } = useVisualMode(
    props.interview ? SHOW : EMPTY
  );

  //passed to the form component as props
  const save = (name, interviewer) => {

    //creates the object needed by the form
    const interview = {
      student: name,
      interviewer
    };

    //transition to saving view, true -> allows us to go directly to show mode
    transition(SAVING, true);

    //calls function from useApplicationData.js
    props.bookInterview(props.id, interview)

      //transition to SHOW so that the appointment stays on the page
      .then(() => transition(SHOW))

      //true allows us to go back to show mode directly
      .catch(error => transition(ERROR_SAVE, true))

  }

  //passed to show view as props
  const deleteInterview = () => {

    transition(CONFIRM, true);

    transition(DELETING, true);

    props.cancelInterview(props.id)
      .then(() => transition(EMPTY))
      .catch(error => {
        transition(ERROR_DELETE, true)
      })
  }

  return (
    <article data-testid="appointment" className="appointment">
      <Header time={props.time} />
      {/* show the components conditionally based on the visual mode hook */}
      {mode === EMPTY && <Empty onAdd={() => transition(CREATE)} />}
      {mode === SHOW && (
        <Show
          student={props.interview.student}
          interviewer={props.interview.interviewer}
          onDelete={() => transition(CONFIRM)}
          onEdit={() => transition(EDIT)}
        />
      )}
      {mode === CREATE && (
        <Form
          interviewers={props.interviewers}
          onCancel={() => back()}
          onSave={save}
        />
      )}
      {mode === EDIT && (
        <Form
          name={props.interview.student}
          interviewer={props.interview.interviewer.id}
          interviewers={props.interviewers}
          onChange={() => props.onChange()}
          onKeyUp={() => props.onKeyUp()}
          onCancel={() => back()}
          onSave={save}
        />
      )}
      {mode === SAVING && <Status message="Saving..." />}
      {mode === DELETING && <Status message="Deleting..." />}
      {mode === CONFIRM && (
        <Confirm
          message="Are you sure you would like to delete?"
          onConfirm={deleteInterview}
          onCancel={() => back()}
        />
      )}
      {mode === ERROR_SAVE && (
        <Error
          message="Error saving entry"
          onClose={() => back()}
        />
      )}
      {mode === ERROR_DELETE && (
        <Error
          message="Error deleting entry"
          onClose={() => back()}
        />
      )}
    </article>
  )

}

Appointment.propTypes = {
  interviewers: PropTypes.array
};

export default Appointment;