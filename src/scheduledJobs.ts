import { In } from "typeorm";
import { DiseaseOccurrenceRepository, PatientsRepository } from "./repositories";
import { DiseaseOccurrence, Patient } from "./models";

// This function will be called by a cron job
export const verifyOccurrencesExpiration = async () => {
  // Find all occurrences with status "Suspeito" or "Infectado"
  const occurrences = await DiseaseOccurrenceRepository.find({
    where: {
      status: In(["Suspeito", "Infectado"])
    },
    relations: ["Disease"]
  })

  const dayInMs = 1000 * 60 * 60 * 24

  occurrences.forEach(async (occurrence) => {
    const currentDate = new Date().getTime()

    // Calculate the expiration date based on the disease monitoring days
    const occurrenceStartDate = occurrence.dateStart.getTime()
    let expirationDate = occurrenceStartDate
    if (occurrence.status === "Suspeito") {
      let monitoringDays = 0;
      for (let disease of occurrence.diseases) {
        monitoringDays = Math.max(monitoringDays, disease.suspectedMonitoringDays);
      }
      expirationDate += monitoringDays * dayInMs
    } else {
      let monitoringDays = 0;
      for (let disease of occurrence.diseases) {
        monitoringDays = Math.max(monitoringDays, disease.infectedMonitoringDays);
      }
      expirationDate += monitoringDays * dayInMs
    }

    // If the current date is greater than the expiration date, update the occurrence status
    if (currentDate >= expirationDate) {
      const newStatus = "Saudável";
      try {
        await DiseaseOccurrenceRepository.createQueryBuilder()
          .update(DiseaseOccurrence)
          .set({ status: newStatus, dateEnd: new Date() })
          .where("id = :id", { id: occurrence.id })
          .execute();
      } catch (error) { console.log('CronJob - Occurrence error: ', error) }
    }
  })
}