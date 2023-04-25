"use client";
import { Key, useEffect, useState } from "react";
import axios from "axios";

export default function Page({ params }: { params: { id: string } }) {
  const { id } = params;
  const [patient, setPatient] = useState<any>(null);

  useEffect(() => {
    const getPatient = async () => {
      const res = await axios.get("/api/patient", { params: { id } });

      setPatient(res.data);
    };

    getPatient();
  }, [id]);

  if (patient) {
    return (
      <form style={{ marginTop: "20px" }}>
        <h2>Patient Details</h2>
        <label>First Name:</label>
        <input type="text" disabled value={patient?.firstName} />
        <label>Last Name</label>
        <input type="text" disabled value={patient?.lastName} />
        <label>Date Of Birth</label>
        <input type="date" disabled value={patient?.dateOfBirth} />
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
            {patient?.vaccinations?.map(
              (vaccination: {
                vaccine: {
                  id: Key | null | undefined;
                  disease: string | number | readonly string[] | undefined;
                  brand: string | number | readonly string[] | undefined;
                };
                date: string | number | readonly string[] | undefined;
              }) => {
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
                        value={process.env["HEALTH_CARE_PROVIDER"] || "City MD"}
                      />
                    </td>
                    <td>
                      <input type="date" disabled value={vaccination.date} />
                    </td>
                  </tr>
                );
              }
            )}
          </tbody>
        </table>
      </form>
    );
  } else {
    return <div>Loading...</div>;
  }
}
