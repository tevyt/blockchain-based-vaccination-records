package main

import (
	"fmt"
	"encoding/json"
	"log"
	"github.com/hyperledger/fabric-contract-api-go/contractapi"
)


// SmartContract provides functions for managing Vaccination Records
type SmartContract struct {
	contractapi.Contract
}


type Patient struct {
	ID string `json:"id"`
	FirstName string `json:"firstName"`
	LastName string `json:"lastName"`
	DateOfBirth string `json:"dateOfBirth"`
	Vaccinations []Vaccination `json:"vaccinations"`
}

type Vaccination struct {
	ID string `json:"id"`
	Name string `json:"name"`
	Date string `json:"date"`
	HealthCareProvider string `json:"healthCareProvider"`
}


func (s *SmartContract) PatientExists(ctx contractapi.TransactionContextInterface, id string) (bool, error) {
	patientJSON, err := ctx.GetStub().GetState(id)
	if err != nil {
		return false, fmt.Errorf("Failed to read from world state: %v", err)
	}

	return patientJSON != nil, nil
}

func (s *SmartContract) CreatePatient(ctx contractapi.TransactionContextInterface, id string, firstName string, lastName string, dateOfBirth string) error {
	exists, err := s.PatientExists(ctx, id)
	if err != nil {
		return err
	}
	if exists {
		return fmt.Errorf("The patient %s already exists", id)
	}

	patient := Patient{
		ID: id,
		FirstName: firstName,
		LastName: lastName,
		DateOfBirth: dateOfBirth,
		Vaccinations: []Vaccination{},
	}
	patientJSON, err := json.Marshal(patient)
	if err != nil {
		return err
	}

	return ctx.GetStub().PutState(id, patientJSON)
}

func (s *SmartContract) ReadPatient(ctx contractapi.TransactionContextInterface, id string) (*Patient, error) {
	patientJSON, err := ctx.GetStub().GetState(id)
	if err != nil {
		return nil, fmt.Errorf("Failed to read from world state: %v", err)
	}
	if patientJSON == nil {
		return nil, fmt.Errorf("The patient %s does not exist", id)
	}

	var patient Patient
	err = json.Unmarshal(patientJSON, &patient)
	if err != nil {
		return nil, err
	}

	return &patient, nil
}


func main(){
	vaccinationChainCode, err := contractapi.NewChaincode(new(SmartContract))
	if err != nil {
		log.Panicf("Error creating chaincode: %v", err)
	}

	if err := vaccinationChainCode.Start(); err != nil {
		log.Panicf("Error starting chaincode: %v", err)
	}
}