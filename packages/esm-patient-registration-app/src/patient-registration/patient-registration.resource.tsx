import { openmrsFetch } from '@openmrs/esm-framework';
import { CapturePhotoProps, Patient, Relationship } from './patient-registration-types';

export const uuidIdentifier = '05a29f94-c0ed-11e2-94be-8c13b969e334';
export const uuidTelephoneNumber = '14d4f066-15f5-102d-96e4-000c29c2a5d7';

function dataURItoFile(dataURI: string) {
  const byteString = atob(dataURI.split(',')[1]);
  const mimeString = dataURI.split(',')[0].split(':')[1].split(';')[0];
  // write the bytes of the string to a typed array
  const buffer = new Uint8Array(byteString.length);

  for (let i = 0; i < byteString.length; i++) {
    buffer[i] = byteString.charCodeAt(i);
  }

  const blob = new Blob([buffer], { type: mimeString });
  return new File([blob], 'patient-photo.png');
}

export function savePatient(abortController: AbortController, patient: Patient, patientUuid: string) {
  return openmrsFetch(`/ws/rest/v1/patient/${patientUuid || ''}`, {
    headers: {
      'Content-Type': 'application/json',
    },
    method: 'POST',
    body: patient,
    signal: abortController.signal,
  });
}

export function generateIdentifier(source: string, abortController: AbortController) {
  return openmrsFetch(`/ws/rest/v1/idgen/identifiersource/${source}/identifier`, {
    headers: {
      'Content-Type': 'application/json',
    },
    method: 'POST',
    body: {},
    signal: abortController.signal,
  });
}

export function deletePersonName(nameUuid: string, personUuid: string, abortController: AbortController) {
  return openmrsFetch(`/ws/rest/v1/person/${personUuid}/name/${nameUuid}`, {
    method: 'DELETE',
    signal: abortController.signal,
  });
}

export function saveRelationship(abortController: AbortController, relationship: Relationship) {
  return openmrsFetch('/ws/rest/v1/relationship', {
    headers: {
      'Content-Type': 'application/json',
    },
    method: 'POST',
    body: relationship,
    signal: abortController.signal,
  });
}

export async function savePatientPhoto(
  patientUuid: string,
  content: string,
  url: string,
  date: string,
  conceptUuid: string,
  abortController: AbortController,
) {
  const formData = new FormData();
  formData.append('patient', patientUuid);
  formData.append('file', dataURItoFile(content));
  formData.append(
    'json',
    JSON.stringify({
      person: patientUuid,
      concept: conceptUuid,
      groupMembers: [],
      obsDatetime: date,
    }),
  );

  return openmrsFetch(url, {
    method: 'POST',
    signal: abortController.signal,
    body: formData,
  });
}

export async function fetchPatientPhotoUrl(
  patientUuid: string,
  concept: string,
  abortController: AbortController,
): Promise<CapturePhotoProps> {
  const { data } = await openmrsFetch(`/ws/rest/v1/obs?patient=${patientUuid}&concept=${concept}&v=full`, {
    method: 'GET',
    signal: abortController.signal,
  });
  const item = data.results[0];

  if (item) {
    return {
      dateTime: item.obsDatetime,
      imageData: item.value.links.uri,
    };
  } else {
    return null;
  }
}

export async function fetchPerson(query: string, abortController: AbortController) {
  return openmrsFetch(`/ws/rest/v1/person?q=${query}`, {
    signal: abortController.signal,
  });
}
