"use client";
import { useState } from "react";

import { Inter } from "next/font/google";
import countryList from "./countries";

export default function Home() {
  const [patientId, setPatientId] = useState("");
  const [patientCountry, setPatientCountry] = useState("US");

  const handlePatientIDChange = (e) => {
    setPatientId(e.target.value);
  };

  const handlePatientCountryChange = (e) => {
    setPatientCountry(e.target.value);
  };

  const handleSearch = (e) => {
    e.preventDefault();
    console.log(patientId, patientCountry);
  };

  return (
    <div>
      <h1>Patient Management</h1>
      <form>
        <label>Patient ID</label>
        <input type="text" value={patientId} onChange={handlePatientIDChange} />

        <label>Patient Country</label>
        <select value={patientCountry} onChange={handlePatientCountryChange}>
          {Object.keys(countryList).map((countryCode) => {
            return (
              <option key={countryCode} value={countryCode}>
                {countryList[countryCode]}
              </option>
            );
          })}
        </select>
        <button onClick={handleSearch}>Search</button>
      </form>
    </div>
  );
}
