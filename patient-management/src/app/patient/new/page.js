"use client";
import countryList from "../../countries";

import { useState } from "react";

import axios from "axios";
import { useRouter } from "next/navigation";

function NewPatientPage() {
  const [patientId, setPatientId] = useState("");
  const [patientCountry, setPatientCountry] = useState("US");
  const [firstName, setFirstName] = useState("");
  const [lastName, setLastName] = useState("");
  const [dateOfBirth, setDateOfBirth] = useState("");

  const { push } = useRouter();

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      const resp = await axios.post("/api/patient", {
        nationalID: patientId,
        country: patientCountry,
        firstName,
        lastName,
        dateOfBirth,
      });
    } finally {
      push("/");
    }
  };

  return (
    <div>
      <h1>New Patient</h1>
      <form>
        <div>
          <label>National ID</label>
          <input
            type="text"
            id="nationalId"
            name="nationalId"
            value={patientId}
            onChange={(e) => setPatientId(e.target.value)}
          />
        </div>
        <div>
          <label>Country</label>
          <select
            id="country"
            name="country"
            defaultValue="US"
            value={patientCountry}
            onChange={(e) => setPatientCountry(e.target.value)}
          >
            {Object.keys(countryList).map((countryCode) => {
              return (
                <option key={countryCode} value={countryCode}>
                  {countryList[countryCode]}
                </option>
              );
            })}
          </select>
        </div>
        <div>
          <label htmlFor="name">Name</label>
          <input
            type="text"
            id="name"
            name="name"
            value={firstName}
            onChange={(e) => setFirstName(e.target.value)}
          />
        </div>
        <div>
          <label htmlFor="surname">Surname</label>
          <input
            type="text"
            id="surname"
            name="surname"
            value={lastName}
            onChange={(e) => setLastName(e.target.value)}
          />
        </div>
        <div>
          <label htmlFor="dateOfBirth">Date of Birth</label>
          <input
            type="date"
            id="dateOfBirth"
            name="dateOfBirth"
            value={dateOfBirth}
            onChange={(e) => setDateOfBirth(e.target.value)}
          />
        </div>
        <button type="submit" onClick={handleSubmit}>
          Save
        </button>
      </form>
    </div>
  );
}

export default NewPatientPage;
