"use client";
import { useEffect, useState } from "react";
import Link from "next/link";

import countryList from "./countries";
import axios from "axios";
import { format } from "date-fns";

export default function Home() {
  const [patientId, setPatientId] = useState("");
  const [patientCountry, setPatientCountry] = useState("US");
  const [patientData, setPatientData] = useState({
    data: null,
    error: null,
    loading: false,
  });

  const [vaccineListing, setVaccineListing] = useState({});

  const [newVaccination, setNewVaccination] = useState(null);

  console.log(
    "Health care provider: ",
    process.env.NEXT_PUBLIC_HEALTH_CARE_PROVIDER
  );

  useEffect(() => {
    const fetchVaccineListing = async () => {
      const { data } = await axios.get("/api/vaccines");
      setVaccineListing(data);
    };
    fetchVaccineListing();
  }, []);

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

  const addVaccinationRecord = (e) => {
    e.preventDefault();
    setNewVaccination({
      disease: Object.keys(vaccineListing)[0],
      brand: vaccineListing[Object.keys(vaccineListing)[0]][0],
      healthCareProvider:
        process.env.NEXT_PUBLIC_HEALTH_CARE_PROVIDER || "City MD",
      date: format(new Date(), "yyyy-MM-dd"),
    });
  };

  const handleNewVaccinationDiseaseChange = (e) => {
    setNewVaccination((prev) => ({
      ...prev,
      disease: e.target.value,
      brand: vaccineListing[e.target.value][0],
    }));
  };

  const handleNewVaccinationBrandChange = (e) => {
    setNewVaccination((prev) => ({
      ...prev,
      brand: e.target.value,
    }));
  };

  const handleNewVaccinationDateChange = (e) => {
    setNewVaccination((prev) => ({
      ...prev,
      date: e.target.value,
    }));
  };

  const saveNewVaccination = async (e) => {
    e.preventDefault();
    try {
      const { data } = await axios.post("/api/vaccines", {
        id: patientId,
        country: patientCountry,
        ...newVaccination,
      });
    } finally {
      setPatientData((patiendData) => {
        return {
          ...patiendData,
          data: {
            ...patiendData.data,
            vaccinations: [
              ...patiendData.data.vaccinations,
              {
                vaccine: {
                  brand: newVaccination.brand,
                  disease: newVaccination.disease,
                  id: newVaccination.disease + newVaccination.brand,
                  healthCareProvider: newVaccination.healthCareProvider,
                  date: newVaccination.date,
                },
              },
            ],
          },
        };
      });

      setNewVaccination(null);
    }
  };

  const cancelNewVaccination = (e) => {
    e.preventDefault();
    setNewVaccination(null);
  };

  return (
    <div>
      <h1>Patient Records Management</h1>
      <Link href="/patient/new">Add New Patient</Link>
      <form>
        <label>Patient ID:</label>
        <input type="text" value={patientId} onChange={handlePatientIDChange} />
        <label>Patient Country:</label>
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
          <h2>Patient Details</h2>
          <label>First Name:</label>
          <input type="text" disabled value={patientData.data?.firstName} />
          <label>Last Name</label>
          <input type="text" disabled value={patientData.data?.lastName} />
          <label>Date Of Birth</label>
          <input type="date" disabled value={patientData.data?.dateOfBirth} />
          <h2>Vaccinations</h2>
          <table>
            <thead>
              <tr>
                <th>Disease</th>
                <th>Brand</th>
                <th>Health Care Provider</th>
                <th>Date</th>
              </tr>
            </thead>
            <tbody>
              {patientData.data?.vaccinations?.map((vaccination) => {
                return (
                  <tr key={vaccination.vaccine.id}>
                    <td>
                      <input
                        type="text"
                        disabled
                        value={vaccination.vaccine.disease}
                      />
                    </td>
                    <td>
                      <input
                        type="text"
                        disabled
                        value={vaccination.vaccine.brand}
                      />
                    </td>
                    <td>
                      <input
                        type="text"
                        disabled
                        value={vaccination.vaccine.healthCareProvider}
                      />
                    </td>
                    <td>
                      <input type="date" disabled value={vaccination.date} />
                    </td>
                  </tr>
                );
              })}
              {newVaccination && (
                <tr>
                  <td>
                    <select
                      value={newVaccination.disesae}
                      onChange={handleNewVaccinationDiseaseChange}
                    >
                      {Object.keys(vaccineListing).map((disesae) => {
                        return (
                          <option key={disesae} value={disesae}>
                            {disesae}
                          </option>
                        );
                      })}
                    </select>
                  </td>
                  <td>
                    <select
                      value={newVaccination.brand}
                      onChange={handleNewVaccinationBrandChange}
                    >
                      {newVaccination.disease
                        ? vaccineListing[newVaccination.disease].map(
                            (brand) => {
                              return (
                                <option key={brand} value={brand}>
                                  {brand}
                                </option>
                              );
                            }
                          )
                        : []}
                    </select>
                  </td>
                  <td>
                    <input
                      type="text"
                      disabled
                      value={newVaccination.healthCareProvider}
                    />
                  </td>
                  <td>
                    <input
                      type="date"
                      value={newVaccination.date}
                      onChange={handleNewVaccinationDateChange}
                    />
                  </td>
                </tr>
              )}
            </tbody>
          </table>
          {newVaccination ? (
            <>
              <button onClick={saveNewVaccination}>Save</button>
              <button onClick={cancelNewVaccination}>Cancel</button>
            </>
          ) : (
            <button onClick={addVaccinationRecord}>Add Vaccination</button>
          )}
        </form>
      )}
    </div>
  );
}
