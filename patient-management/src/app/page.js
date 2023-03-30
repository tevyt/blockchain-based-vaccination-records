"use client";
import { useState } from "react";

import countryList from "./countries";
import axios from "axios";

export default function Home() {
  const [patientId, setPatientId] = useState("");
  const [patientCountry, setPatientCountry] = useState("US");
  const [patientData, setPatientData] = useState({
    data: null,
    error: null,
    loading: false,
  });

  const handlePatientIDChange = (e) => {
    setPatientId(e.target.value);
  };

  const handlePatientCountryChange = (e) => {
    setPatientCountry(e.target.value);
  };

  const handleSearch = async (e) => {
    e.preventDefault();
    setPatientData({ data: null, error: null, loading: true });
    try {
      const data = await axios.get("/api/patient", {
        params: { id: patientId, country: patientCountry },
      });

      setPatientData({ data: data.data, error: null, loading: false });
    } catch (e) {
      setPatientData({ data: null, error: e, loading: false });
    }
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
      {patientData.loading && <h1>Loading...</h1>}
      {patientData.error && (
        <h1 style={{ color: "red" }}>
          Error: An Error occured fetching patient.
        </h1>
      )}
      {patientData.data && (
        <form style={{ marginTop: "20px" }}>
          <div>
            <label>First Name</label>
            <input type="text" disabled value={patientData.data?.firstName} />
          </div>
          <div>
            <label>Last Name</label>
            <input type="text" disabled value={patientData.data?.lastName} />
          </div>
          <div>
            <label>Date Of Birth</label>
            <input type="date" disabled value={patientData.data?.dateOfBirth} />
          </div>
          <div style={{ marginTop: "10px" }}>
            <h2>Vaccinations</h2>
            {patientData.data?.vaccinations?.map((vaccination) => {
              return (
                <div key={vaccination.vaccine.id} style={{ marginTop: "10px" }}>
                  <div>
                    <label>Disease</label>
                    <input
                      type="text"
                      disabled
                      value={vaccination.vaccine.disease}
                    />
                  </div>
                  <div>
                    <label>Brand</label>
                    <input
                      type="text"
                      disabled
                      value={vaccination.vaccine.brand}
                    />
                  </div>
                  <div>
                    <label>Health Care Provider</label>
                    <input
                      type="text"
                      disabled
                      value={vaccination.healthCareProvider}
                    />
                  </div>
                  <div>
                    <label>Date</label>
                    <input type="date" disabled value={vaccination.date} />
                  </div>
                </div>
              );
            })}
          </div>
        </form>
      )}
    </div>
  );
}
