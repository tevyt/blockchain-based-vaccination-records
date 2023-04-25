"use client";
import { Inter } from "next/font/google";
import countries from "./utils/countries";
import axios from "axios";

const inter = Inter({ subsets: ["latin"] });

export default function Home() {
  const searchPatient = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    const nationalID = e.currentTarget.nationalID.value;
    const country = e.currentTarget.country.value;

    const res = await axios.get("/api/patients", {
      params: { id: nationalID, country },
    });

    const { id } = res.data;

    console.log(id);
  };

  return (
    <main className="flex min-h-screen flex-col items-center justify-between p-24">
      <div>
        <h1 className="text-6xl font-bold">Patient Search</h1>
        <form className="flex flex-col" onSubmit={searchPatient}>
          <div className="flex flex-col">
            <label htmlFor="nationalID">National ID</label>
            <input type="text" id="nationalID" name="nationalID" />
          </div>
          <div className="flex flex-col my-2">
            <label htmlFor="country">Country of Residence</label>
            <select defaultValue="US" name="country">
              {Object.keys(countries).map((code) => (
                <option key={code} value={code}>
                  {countries[code as keyof typeof countries]}
                </option>
              ))}
            </select>
            <button
              type="submit"
              className="my-2 w-1/4 border-solid border-2 border-black rounded-md bg-blue-400 text-white"
            >
              Search
            </button>
          </div>
        </form>
      </div>
    </main>
  );
}
