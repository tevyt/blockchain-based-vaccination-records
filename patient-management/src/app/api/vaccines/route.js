import { exec } from "child_process";
import { NextResponse } from "next/server";

const ordererHost = "127.0.0.1:7050";

export async function GET() {
  let promise = new Promise((resolve, reject) => {
    exec(
      `peer chaincode query -o ${ordererHost} -C ch1 -n vaccinecc -c '{"Args":["ReadVaccinationListing"]}'`,
      (error, stdout, stderr) => {
        if (error) {
          console.log(`error: ${error.message}`);
          reject(error.message);
          return;
        }
        if (stderr) {
          console.log(`stderr: ${stderr}`);
          reject(stderr);
          return;
        }
        console.log(`stdout: ${stdout}`);
        resolve(stdout);
      }
    );
  });

  const result = await promise;

  const { vaccines } = JSON.parse(result);

  const vaccineMap = new Map();
  vaccines.forEach((vaccine) => {
    if (!vaccineMap.has(vaccine.disease)) {
      vaccineMap.set(vaccine.disease, [vaccine.brand]);
    } else {
      vaccineMap.get(vaccine.disease).push(vaccine.brand);
    }
  });
  console.log(vaccineMap);

  return NextResponse.json(Object.fromEntries(vaccineMap));
}

export async function POST(request) {
  const { id, country } = request.json;
  let promise = new Promise((resolve, reject) => {
    exec(
      `peer chaincode invoke -o ${ordererHost} -C ch1 -n vaccinecc -c '{"Args":["AddVaccineToPatientRecord", "${id}", "${country}"]}'`,
      (error, stdout, stderr) => {
        if (error) {
          console.log(`error: ${error.message}`);
          reject(error.message);
          return;
        }
        if (stderr) {
          console.log(`stderr: ${stderr}`);
          reject(stderr);
          return;
        }
        console.log(`stdout: ${stdout}`);
        resolve(stdout);
      }
    );
  });

  const result = await promise;
  console.log(result);
  return NextResponse.json(JSON.parse(result));
}