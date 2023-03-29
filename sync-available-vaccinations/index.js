const JSSoup = require("jssoup").default;
const axios = require("axios");
const { exec } = require("child_process");

const CDCVaccineListURL = "https://www.cdc.gov/vaccines/vpd/vaccines-list.html";

const ordererHost = "127.0.0.1:7050";

axios.get(CDCVaccineListURL).then(
  (res) => {
    console.log("Got response: " + res.status);
    const data = res.data;
    const soup = new JSSoup(data);
    const vaccineList = soup.findAll("ul", { class: "bullet-list" })[0];

    vaccineList.append(soup.findAll("ul", { class: "bullet-list" })[11]);

    const vaccines = vaccineList
      .findAll("li")
      .map((listItem) => {
        if (listItem.findAll("a").length === 0) return null;
        const disease = listItem.findAll("a")[0].text;
        const hasBrands = listItem.find("ul");

        let brands = ["generic"];
        if (hasBrands) {
          brands = hasBrands.findAll("li").map((brand) => brand.text);
        }
        return { disease, brands };
      })
      .filter((vaccine) => vaccine !== null);

    console.log("Vaccines: ", vaccines);

    console.log((vaccines || []).length + " vaccines found");

    const syncVaccineListingContractBody = vaccines
      .map((vaccine) => {
        return vaccine.brands.map((brand) => {
          return {
            id: (vaccine.disease + "-" + brand)
              .toLowerCase()
              .replace(/\s/g, ""),
            disease: vaccine.disease,
            brand,
          };
        });
      })
      .flat();

    console.log(
      "Sync Vaccine Listing Contract Body: ",
      syncVaccineListingContractBody
    );

    exec(
      `peer chaincode invoke -o ${ordererHost} -C ch1 -n vaccinecc -c '{"Args":["SyncVaccinationListing", ${JSON.stringify(
        JSON.stringify(syncVaccineListingContractBody)
      )}]}'`,
      (error, stdout, stderr) => {
        if (error) {
          console.log(`error: ${error.message}`);
          return;
        }
        if (stderr) {
          console.log(`stderr: ${stderr}`);
          return;
        }
        console.log(`stdout: ${stdout}`);
      }
    );
  },

  (e) => {
    console.error("Got error: " + e.message);
  }
);
