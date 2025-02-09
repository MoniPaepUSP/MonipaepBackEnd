import { In } from 'typeorm';
import { DiseaseOccurrenceRepository, PatientsRepository } from './repositories';
import { DiseaseOccurrence, Patient } from './models';
  
// This function will be called by a cron job
export const verifyOccurrencesExpiration = async () => {

  // Find all occurrences with status "Suspeito" or "Infectado"
  const occurrences = await DiseaseOccurrenceRepository.find ({
    where: {
      status: In (['Suspeito', 'Infectado'])
    },
    relations: ['Disease']
  })

  const dayInMs = 1000 * 60 * 60 * 24

  occurrences.forEach (async (occurrence) => {
    const currentDate = (new Date ('2024-10-27T12:00:00.000-03:00')).getTime () // For testing purposes
  
    // Calculate the expiration date based on the disease monitoring days
    const occurrenceStartDate = occurrence.dateStart.getTime ()
    let expirationDate = occurrenceStartDate
    if(occurrence.status === 'Suspeito') {
      expirationDate += occurrence.disease.suspectedMonitoringDays * dayInMs
    } else {
      expirationDate += occurrence.disease.infectedMonitoringDays * dayInMs
    }

    // If the current date is greater than the expiration date, update the occurrence status
    if(currentDate >= expirationDate) {
      const newStatus = occurrence.status === 'Suspeito' ? 'Saudável' : 'Curado'
      try {
        await DiseaseOccurrenceRepository.createQueryBuilder ()
          .update (DiseaseOccurrence)
          .set ({ status: newStatus, dateEnd: new Date () })
          .where ('id = :id', { id: occurrence.id })
          .execute ()

        const patientDiseaseOccurrences = await DiseaseOccurrenceRepository.find ({
          where: {
            patientId: occurrence.patientId
          }
        })

        let finalStatus = patientDiseaseOccurrences[0].status
        if(finalStatus !== 'Óbito') {
          for(const occurrence of patientDiseaseOccurrences) {
            if(occurrence.status === 'Óbito') {
              finalStatus = 'Óbito'
              break
            }
            else if(occurrence.status === 'Infectado') {
              finalStatus = 'Infectado'
            }
            else if(occurrence.status === 'Suspeito' && finalStatus !== 'Infectado') {
              finalStatus = 'Suspeito'
            }
            else if(
              (occurrence.status === 'Saudável' || occurrence.status === 'Curado') 
              && finalStatus !== 'Infectado' && finalStatus !== 'Suspeito'
            ) {
              finalStatus = 'Saudável'
            }
          }
        }

        try {
          await PatientsRepository.createQueryBuilder ()
            .update (Patient)
            .set ({ status: finalStatus })
            .where ('id = :id', { id: occurrence.patientId })
            .execute ()
        } catch (error) { console.log ('CronJob - Patient error: ', error) }
      } catch (error) { console.log ('CronJob - Occurrence error: ', error) }
    }
  })
}