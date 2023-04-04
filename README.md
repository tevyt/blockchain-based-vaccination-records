# Distributed Vaccination Record Verification

This project is a blockchain-based system which uses Hyperledger Fabric to securely record and verify vaccination records. The system is designed to enable healthcare providers to securely store and share vaccination records with patients and other healthcare providerrs. The system uses a permissioned blockchain network which ensures that only authorized parties can access and update records, providing greater security guarantees at a lower cost than systems built around public blockcain networks like Ethereum.

Overall, the project aims to improve the accuracy and efficiency of vaccination records, while also ensuring data security and privacy. With a secure, blockchain-based systen in place, healthcare providers can have greater confidence in the integrity of vaccination records, and patients can have more control over their healthcare data.

## Running the project in development mode.

1. Clone the Fabric Repository from [Github](https://github.com/hyperledger/fabric).
2. From the Fabric directory run the commands to build the orderer, peer and configtxgen binaries:

```bash
make orderer peer configtxgen
```

3. Set the `PATH` environment variable to include the orderer and peer binaries:

```bash
export PATH=$(pwd)/build/bin:$PATH
```

4. Set the `FABRIC_CFG_PATH` environment variable to point to the `sampleconfig` folder:

```bash
export FABRIC_CFG_PATH=$(pwd)/sampleconfig
```

5. Create the `hyperledger` subdirectory in the `/var` directory. This is the default location Fabric uses to stored blocks as defined in the orderer `orderer.yaml` and peer `core.yaml` files. To create the `hyperledger` subdirectory execute the following

```bash
sudo mkdir /var/hyperledger
sudo chown $USER /var/hyperledger
```

6. Generate the genesis block for the ordering service. Run the following command to generate the genesis block and store it in `$(pwd)/sampleconfig/genesisblock` so that it can be used by the orderer in the next step when the orderer is started.

```bash
configtxgen -profile SampleDevModeSolo -channelID syschannel -outputBlock genesisblock -configPath $FABRIC_CFG_PATH -outputBlock "$(pwd)/sampleconfig/genesisblock"
```

### Start the orderer

Run the following command to start the orderer with the `SampleDevModeSolo` profile and start the ordering service:

```bash
ORDERER_GENERAL_GENESISPROFILE=SampleDevModeSolo orderer
```

### Start the peer in DevMode

Open another terminal window and set the required environment variables to override the peer configuration and start the peer node.

```bash
export CORE_OPERATIONS_LISTENADDRESS=127.0.0.1:9444
```

Starting the peer with the `--peer-chaincodedev=true` flag puts the peer into DevMode.

```bash
export PATH=$(pwd)/build/bin:$PATH
export FABRIC_CFG_PATH=$(pwd)/sampleconfig
FABRIC_LOGGING_SPEC=chaincode=debug CORE_PEER_CHAINCODELISTENADDRESS=0.0.0.0:7052 peer node start --peer-chaincodedev=true
```

### Create channel and join peer

Open another terminal window and run the following commands to generate the channel creation transaction using the `conftxgen` tool. This command creates the channel `ch1` with the `SampleSingleMSPChannel` profile:

```bash
export PATH=$(pwd)/build/bin:$PATH
export FABRIC_CFG_PATH=$(pwd)/sampleconfig
configtxgen -channelID ch1 -outputCreateChannelTx ch1.tx -profile SampleSingleMSPChannel -configPath $FABRIC_CFG_PATH
peer channel create -o 127.0.0.1:7050 -c ch1 -f ch1.tx
```

Now join the peer to the channel by running the following command:

```bash
peer channel join -b ch1.block
```

The peer has now joined channel `ch1`.

### Build the chain code

The chain code in this repository can be built with the command:

```bash
go build -o vaccineVerificationChainCode .
```

### Start the chaincode

When `DevMode` is enabled on the peer, environment variable `CORE_CHAINCODE_ID_NAME` must be set with the format `<CHAINCODE_NAME>`:`<CHAINCODE_VERSION>`. For example the value `vaccinecc:1.0` could be used. Run the following command to start the chaincode and connect it to the peer:

```bash
CORE_CHAINCODE_LOGLEVEL=debug CORE_PEER_TLS_ENABLED=false CORE_CHAINCODE_ID_NAME=vaccinecc:1.0 ./simpleChaincode -peer.address 127.0.0.1:7052
```

### Approve and commit the chaincode definition

Now you need to run the following Fabric chaincode lifecycle commands to approve and commit the chaincode definition the channel:

```bash
peer lifecycle chaincode approveformyorg  -o 127.0.0.1:7050 --channelID ch1 --name vaccincecc --version 1.0 --sequence 1 --init-required --signature-policy "OR ('SampleOrg.member')" --package-id vaccinecc:1.0

peer lifecycle chaincode checkcommitreadiness -o 127.0.0.1:7050 --channelID ch1 --name vaccinecc --version 1.0 --sequence 1 --init-required --signature-policy "OR ('SampleOrg.member')"

peer lifecycle chaincode commit -o 127.0.0.1:7050 --channelID ch1 --name vaccinecc --version 1.0 --sequence 1 --init-required --signature-policy "OR ('SampleOrg.member')" --peerAddresses 127.0.0.1:7051
```

## Available operations

In HyperLedger Fabric chaincode there are 2 types of operations `query` and `invoke`. `query` operations are meant to retrieve information from the ledger without modifying it. `invoke` operations create modifications on the ledger, in this project's case it includes operations which modify or create patient or vaccination records. The following is a list of operations and how they can be invoked in development mode.

- `PatientExists` searches for a patient by ID, returns the a `boolean` value indicating whether or not a record exists for this patient.

Command:

```bash
CORE_PEER_ADDRESS=127.0.0.1:7051 peer chaincode query -o 127.0.0.1:7050 -C ch1 -n vaccinecc -c '{"Args":["PatientExists","124"]}'
```

Response:

```json
true
```

- `CreatePatient` creates a patient record and saves it arguments are `id`, `firstName`, `lastName` and `dateOfBirth` in that order

Command:

```bash
CORE_PEER_ADDRESS=127.0.0.1:7051 peer chaincode invoke -o 127.0.0.1:7050 -C ch1 -n vaccinecc -c '{"Args":["CreatePatient","125", "Travis", "Smith", "1994-04-15"]}'
```

Response:

```bash
2023-02-23 17:45:30.834 EST 0001 INFO [chaincodeCmd] chaincodeInvokeOrQuery -> Chaincode invoke successful. result: status:200
```

- `ReadPatient` returns a patients information including vaccination records.

Command:

```bash
CORE_PEER_ADDRESS=127.0.0.1:7051 peer chaincode query -o 127.0.0.1:7050 -C ch1 -n vaccinecc -c '{"Args":["ReadPatient","125"]}'
```

Response:

```json
{
  "id": "125",
  "firstName": "Travis",
  "lastName": "Smith",
  "dateOfBirth": "1994-04-15",
  "vaccinations": []
}
```

- `AddVaccination` adds a vaccine to the patient's record the arguments are `patientID`, `vaccineName` `vaccineDate` and `healthCareProvider` in that order.

Command:

```bash
CORE_PEER_ADDRESS=127.0.0.1:7051 peer chaincode invoke -o 127.0.0.1:7050 -C ch1 -n vaccinecc -c '{"Args":["AddVaccinationToPatient","125", "COVID-19", "2020-10-10", "City MD"]}'
```

Response:

```bash
2023-02-24 14:10:35.662 EST 0001 INFO [chaincodeCmd] chaincodeInvokeOrQuery -> Chaincode invoke successful. result: status:200 payload:"{\"id\":\"125\",\"firstName\":\"Travis\",\"lastName\":\"Smith\",\"dateOfBirth\":\"1994-04-15\",\"vaccinations\":[{\"id\":\"a7919e4c-f37f-41e6-be7b-9b764b85e28c\",\"name\":\"COVID-19\",\"date\":\"2020-10-10\",\"healthCareProvider\":\"City MD\"}]}"
```

- `SyncVaccinationListing` updates list of approved CDC vaccines. Vaccinations cannot be added if they do not appear on this list.

## DApps

- [sync-available vaccintions](/sync-available-vaccinations/)
  - Updates the list of vaccines. Data is pulled from publicly available informtation on the vaccines approved by the CDC. The script is written in Javascript and can be executed on a peer with nodejs installed.
  ```bash
  npm install
  node ./index.js
  ```
- [patient-management](/patient-management/)
  - Interface that may be used by health care providers to create and manage patient vaccination records. Written using [Next.js](https://nextjs.org/). Can be executed on a peer with node installed.
    ![Screenshot from the patient management screen.](/docs/patient_management.png)

## Architecture

Each of the components listed below will run on their own peer. HyperLedger allows for peers to be asigned functions based on their purpose in the network. In addition, each peer stores a copy of the blockchain, allowing for peers on the network to endorse changes. This prevents a single rogue healthcare provider from fradulently modifying patient records.

![Architecture of HyperLedger blockchain network.](/docs/HyperLedger%20Based%20Vaccination%20Verification.drawio.png)

## TODO

The following task are still to be completed.

- [x] Generate patient ID rather than requiring one on patient creation, this prevents duplicate IDs.
- [x] Create a DApp for patient record creation and maintainance.
- [x] Adds script for synchronizing with the CDC's list of approved vaccines.
- [ ] Create DApp for vaccination record verification.
- [ ] Design and deploy production architecture proof-of-concept.
- [ ] Add permissions around invoke/query methods.
