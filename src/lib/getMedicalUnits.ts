export interface Place {
  id: string;
  displayName: {
    text: string,
    languageCode: string
  };
  formattedAddress: string;
  location: {
    latitude: number,
    longitude: number
  },
  regularOpeningHours: {
    openNow: boolean,
    periods: {
      open: {
        day: number,
        hour: number,
        minute: number
      },
      close: {
        day: number,
        hour: number,
        minute: number
      }
    }[],
    weekdayDescriptions: string[]
  }
}

export async function getMedicalUnits({ state, city, neighborhood, nextPageTokenUBS, nextPageTokenUPA }: {
  state: string,
  city: string,
  neighborhood?: string,
  nextPageTokenUBS?: string,
  nextPageTokenUPA?: string
}): Promise<{ UPA: Place[], UBS: Place[], nextPageTokenUBS?: string, nextPageTokenUPA?: string }> {
  let responseUBS: any = {};
  let responseUPA: any = {};

  const url = 'https://places.googleapis.com/v1/places:searchText';
  const headers = {
    'Content-Type': 'application/json',
    'X-Goog-Api-Key': `${process.env.GOOGLE_MAPS_API_KEY}`,
    'X-Goog-FieldMask': 'places.displayName,places.formattedAddress,places.id,places.location,places.regularOpeningHours,nextPageToken'
  }

  const requestUPA = {
    textQuery: `UPA ${neighborhood}, ${city} - ${state}`,
    pageSize: 20,
    rankPreference: 'RELEVANCE',
    languageCode: 'pt',
    pageToken: nextPageTokenUPA
  }
  const requestUBS = {
    textQuery: `UBS ${neighborhood}, ${city} - ${state}`,
    pageSize: 20,
    rankPreference: 'RELEVANCE',
    languageCode: 'pt',
    pageToken: nextPageTokenUBS
  }

  if (nextPageTokenUBS || nextPageTokenUPA) {
    if (nextPageTokenUPA) {
      responseUPA = await fetch(url, {
        method: "POST",
        headers: headers,
        body: JSON.stringify(requestUPA)
      })
    }
    if (nextPageTokenUBS) {
      responseUBS = await fetch(url, {
        method: "POST",
        headers: headers,
        body: JSON.stringify(requestUBS)
      })
    }
  } else {
    responseUBS = await fetch(url, {
      method: "POST",
      headers: headers,
      body: JSON.stringify(requestUBS)
    })
    responseUPA = await fetch(url, {
      method: "POST",
      headers: headers,
      body: JSON.stringify(requestUPA)
    })
  }

  const dataUBS = await responseUBS.json();
  const dataUPA = await responseUPA.json();

  const placesUBS = (dataUBS.places as Place[]) ?? [];
  const placesUPA = (dataUPA.places as Place[]) ?? [];
  let medicalUnits: { UPA: Place[], UBS: Place[], nextPageTokenUBS: string, nextPageTokenUPA: string } = {
    UPA: [],
    UBS: [],
    nextPageTokenUBS: '',
    nextPageTokenUPA: ''
  }

  for (const place of placesUBS) {
    if (place.displayName.text.includes("UBS")) {
      medicalUnits.UBS.push(place);
    }
  }
  medicalUnits.nextPageTokenUBS = dataUBS?.nextPageToken;

  for (const place of placesUPA) {
    if (place.displayName.text.includes("UPA")) {
      medicalUnits.UPA.push(place);
    }
  }
  medicalUnits.nextPageTokenUPA = dataUPA?.nextPageToken

  return medicalUnits;
}