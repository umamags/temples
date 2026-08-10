// Map state names to temples2 JSON file names
const stateToFileNameMap = {
  'Andhra Pradesh': 'andhraPradeshTopTemples',
  'Arunachal Pradesh': 'arunachalPradeshTopTemples',
  'Assam': 'assamTopTemples',
  'Bihar': 'biharTopTemples',
  'Chhattisgarh': 'chhattisgarhTopTemples',
  'Goa': 'goaTopTemples',
  'Gujarat': 'gujaratTopTemples',
  'Haryana': 'haryanaTopTemples',
  'Himachal Pradesh': 'himachalPradeshTopTemples',
  'Jharkhand': 'jharkhandTopTemples',
  'Karnataka': 'karnatakaTopTemples',
  'Kerala': 'keralaTopTemples',
  'Madhya Pradesh': 'madhyaPradeshTopTemples',
  'Maharashtra': 'maharashtraTopTemples',
  'Manipur': 'manipurTopTemples',
  'Meghalaya': 'meghalayaTopTemples',
  'Mizoram': 'mizoramTopTemples',
  'Nagaland': 'nagalandTopTemples',
  'Odisha': 'odishaTopTemples',
  'Punjab': 'punjabTopTemples',
  'Rajasthan': 'rajasthanTopTemples',
  'Sikkim': 'sikkimTopTemples',
  'Tamil Nadu': 'tamilnaduTopTemples',
  'Telangana': 'telanganaTopTemples',
  'Tripura': 'tripuraTopTemples',
  'Uttar Pradesh': 'uttarPradeshTopTemples',
  'Uttarakhand': 'uttarakhandTopTemples',
  'West Bengal': 'westBengalTopTemples',
}

export function getTemples2FileName(stateName) {
  return stateToFileNameMap[stateName] || null
}
