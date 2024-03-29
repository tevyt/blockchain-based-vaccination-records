import { exec } from "child_process";
import { NextResponse, NextRequest } from "next/server";

const ordererHost = "127.0.0.1:7050";

export async function GET(request: NextRequest) {
  const { searchParams } = new URL(request.url);

  const { id, country } = Object.fromEntries(searchParams);

  let promise: Promise<any> = new Promise((resolve, reject) => {
    exec(
      `peer chaincode query -o ${ordererHost} -C ch1 -n vaccinecc -c '{"Args":["ReadPatient", "${id}", "${country}"]}'`,
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

  return NextResponse.json(JSON.parse(result));
}
