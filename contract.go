package main

import (
	"fmt"
	"encoding/json"
	"log"
	"github.com/hyperledger/fabric-contract-api-go/contractapi"
	"github.com/google/uuid"
	"crypto/sha256"
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


func (s *SmartContract) PatientExists(ctx contractapi.TransactionContextInterface, nationalID string, country string) (bool, error) {
	id := createID(nationalID, country)
	patientJSON, err := ctx.GetStub().GetState(id)
	if err != nil {
		return false, fmt.Errorf("Failed to read from world state: %v", err)
	}

	return patientJSON != nil, nil
}

func (s *SmartContract) CreatePatient(ctx contractapi.TransactionContextInterface, nationalID string, country string, firstName string, lastName string, dateOfBirth string) error {
	id := createID(nationalID, country)
	exists, err := s.PatientExists(ctx, nationalID, country)
	if err != nil {
		return err
	}
	if exists {
		return fmt.Errorf("The patient with id: %s and country %s exists", nationalID, country)
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

func (s *SmartContract) ReadPatient(ctx contractapi.TransactionContextInterface, nationalID string, country string) (*Patient, error) {
	id := createID(nationalID, country)
	patientJSON, err := ctx.GetStub().GetState(id)
	if err != nil {
		return nil, fmt.Errorf("Failed to read from world state: %v", err)
	}
	if patientJSON == nil {
		return nil, fmt.Errorf("The patient does not exist")
	}

	var patient Patient
	err = json.Unmarshal(patientJSON, &patient)
	if err != nil {
		return nil, err
	}

	return &patient, nil
}

func (s *SmartContract) AddVaccinationToPatient(ctx contractapi.TransactionContextInterface, nationalID string, country string, vaccineName string, vaccineDate string, healthCareProvider string) (*Patient, error) {
	patientID := createID(nationalID, country)
	patient, err := s.ReadPatient(ctx, nationalID, country)
	if err != nil {
		return nil, err
	}

	vaccineId := uuid.New().String()
	vaccination := Vaccination{
		ID: vaccineId,
		Name: vaccineName,
		Date: vaccineDate,
		HealthCareProvider: healthCareProvider,
	}

	patient.Vaccinations = append(patient.Vaccinations, vaccination)

	patientJSON, err := json.Marshal(patient)
	if err != nil {
		return nil, err
	}

	err = ctx.GetStub().PutState(patientID, patientJSON)
	if err != nil {
		return nil, err
	}

	return patient, nil
}

// Create ID from nationalID and country
func createID(nationalID string, country string) string {
	hash := sha256.Sum256([]byte(nationalID + country))
	return fmt.Sprintf("%x", hash)
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