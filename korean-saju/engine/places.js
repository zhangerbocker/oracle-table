/**
 * Birthplaces, and the surprisingly fiddly business of what the clock said.
 *
 * To place a birth against the sun we need two things the user does not know
 * offhand: the longitude of the birthplace, and the UTC offset its clocks were
 * showing *on that date*. The second one is history, not geography -- Seoul ran
 * on UTC+8:30 for most of the 1950s and observed summer time as recently as 1988.
 *
 * IANA timezone data knows all of this, and the browser ships with it.
 */

export const PLACES = [
  // Korea first -- this is the Korean psychic, after all.
  { id: 'seoul',     name: 'Seoul',        country: 'South Korea', tz: 'Asia/Seoul',     lon: 126.978, group: 'Korea' },
  { id: 'busan',     name: 'Busan',        country: 'South Korea', tz: 'Asia/Seoul',     lon: 129.075, group: 'Korea' },
  { id: 'incheon',   name: 'Incheon',      country: 'South Korea', tz: 'Asia/Seoul',     lon: 126.705, group: 'Korea' },
  { id: 'daegu',     name: 'Daegu',        country: 'South Korea', tz: 'Asia/Seoul',     lon: 128.601, group: 'Korea' },
  { id: 'daejeon',   name: 'Daejeon',      country: 'South Korea', tz: 'Asia/Seoul',     lon: 127.385, group: 'Korea' },
  { id: 'gwangju',   name: 'Gwangju',      country: 'South Korea', tz: 'Asia/Seoul',     lon: 126.852, group: 'Korea' },
  { id: 'ulsan',     name: 'Ulsan',        country: 'South Korea', tz: 'Asia/Seoul',     lon: 129.311, group: 'Korea' },
  { id: 'jeonju',    name: 'Jeonju',       country: 'South Korea', tz: 'Asia/Seoul',     lon: 127.147, group: 'Korea' },
  { id: 'jeju',      name: 'Jeju',         country: 'South Korea', tz: 'Asia/Seoul',     lon: 126.532, group: 'Korea' },
  { id: 'pyongyang', name: 'Pyongyang',    country: 'North Korea', tz: 'Asia/Pyongyang', lon: 125.738, group: 'Korea' },

  { id: 'tokyo',     name: 'Tokyo',        country: 'Japan',       tz: 'Asia/Tokyo',     lon: 139.692, group: 'East Asia' },
  { id: 'osaka',     name: 'Osaka',        country: 'Japan',       tz: 'Asia/Tokyo',     lon: 135.502, group: 'East Asia' },
  { id: 'nagoya',    name: 'Nagoya',       country: 'Japan',       tz: 'Asia/Tokyo',     lon: 136.907, group: 'East Asia' },
  { id: 'fukuoka',   name: 'Fukuoka',      country: 'Japan',       tz: 'Asia/Tokyo',     lon: 130.402, group: 'East Asia' },
  { id: 'sapporo',   name: 'Sapporo',      country: 'Japan',       tz: 'Asia/Tokyo',     lon: 141.355, group: 'East Asia' },
  { id: 'beijing',   name: 'Beijing',      country: 'China',       tz: 'Asia/Shanghai',  lon: 116.407, group: 'East Asia' },
  { id: 'shanghai',  name: 'Shanghai',     country: 'China',       tz: 'Asia/Shanghai',  lon: 121.474, group: 'East Asia' },
  { id: 'guangzhou', name: 'Guangzhou',    country: 'China',       tz: 'Asia/Shanghai',  lon: 113.264, group: 'East Asia' },
  { id: 'chengdu',   name: 'Chengdu',      country: 'China',       tz: 'Asia/Shanghai',  lon: 104.066, group: 'East Asia' },
  { id: 'xian',      name: "Xi'an",        country: 'China',       tz: 'Asia/Shanghai',  lon: 108.940, group: 'East Asia' },
  { id: 'harbin',    name: 'Harbin',       country: 'China',       tz: 'Asia/Shanghai',  lon: 126.535, group: 'East Asia' },
  { id: 'urumqi',    name: 'Ürümqi',       country: 'China',       tz: 'Asia/Shanghai',  lon:  87.617, group: 'East Asia' },
  { id: 'hongkong',  name: 'Hong Kong',    country: 'China',       tz: 'Asia/Hong_Kong', lon: 114.169, group: 'East Asia' },
  { id: 'taipei',    name: 'Taipei',       country: 'Taiwan',      tz: 'Asia/Taipei',    lon: 121.565, group: 'East Asia' },
  { id: 'ulaanbaatar', name: 'Ulaanbaatar', country: 'Mongolia',   tz: 'Asia/Ulaanbaatar', lon: 106.917, group: 'East Asia' },

  { id: 'singapore', name: 'Singapore',    country: 'Singapore',   tz: 'Asia/Singapore', lon: 103.820, group: 'South & Southeast Asia' },
  { id: 'bangkok',   name: 'Bangkok',      country: 'Thailand',    tz: 'Asia/Bangkok',   lon: 100.502, group: 'South & Southeast Asia' },
  { id: 'hanoi',     name: 'Hanoi',        country: 'Vietnam',     tz: 'Asia/Bangkok',   lon: 105.834, group: 'South & Southeast Asia' },
  { id: 'hochiminh', name: 'Ho Chi Minh City', country: 'Vietnam', tz: 'Asia/Ho_Chi_Minh', lon: 106.660, group: 'South & Southeast Asia' },
  { id: 'manila',    name: 'Manila',       country: 'Philippines', tz: 'Asia/Manila',    lon: 120.984, group: 'South & Southeast Asia' },
  { id: 'jakarta',   name: 'Jakarta',      country: 'Indonesia',   tz: 'Asia/Jakarta',   lon: 106.845, group: 'South & Southeast Asia' },
  { id: 'bali',      name: 'Denpasar (Bali)', country: 'Indonesia', tz: 'Asia/Makassar', lon: 115.217, group: 'South & Southeast Asia' },
  { id: 'kualalumpur', name: 'Kuala Lumpur', country: 'Malaysia',  tz: 'Asia/Kuala_Lumpur', lon: 101.687, group: 'South & Southeast Asia' },
  { id: 'yangon',    name: 'Yangon',       country: 'Myanmar',     tz: 'Asia/Yangon',    lon:  96.195, group: 'South & Southeast Asia' },
  { id: 'phnompenh', name: 'Phnom Penh',   country: 'Cambodia',    tz: 'Asia/Phnom_Penh', lon: 104.892, group: 'South & Southeast Asia' },
  { id: 'delhi',     name: 'Delhi',        country: 'India',       tz: 'Asia/Kolkata',   lon:  77.209, group: 'South & Southeast Asia' },
  { id: 'mumbai',    name: 'Mumbai',       country: 'India',       tz: 'Asia/Kolkata',   lon:  72.878, group: 'South & Southeast Asia' },
  { id: 'bengaluru', name: 'Bengaluru',    country: 'India',       tz: 'Asia/Kolkata',   lon:  77.595, group: 'South & Southeast Asia' },
  { id: 'kolkata',   name: 'Kolkata',      country: 'India',       tz: 'Asia/Kolkata',   lon:  88.363, group: 'South & Southeast Asia' },
  { id: 'chennai',   name: 'Chennai',      country: 'India',       tz: 'Asia/Kolkata',   lon:  80.271, group: 'South & Southeast Asia' },
  { id: 'hyderabad', name: 'Hyderabad',    country: 'India',       tz: 'Asia/Kolkata',   lon:  78.486, group: 'South & Southeast Asia' },
  { id: 'karachi',   name: 'Karachi',      country: 'Pakistan',    tz: 'Asia/Karachi',   lon:  67.010, group: 'South & Southeast Asia' },
  { id: 'lahore',    name: 'Lahore',       country: 'Pakistan',    tz: 'Asia/Karachi',   lon:  74.329, group: 'South & Southeast Asia' },
  { id: 'dhaka',     name: 'Dhaka',        country: 'Bangladesh',  tz: 'Asia/Dhaka',     lon:  90.413, group: 'South & Southeast Asia' },
  { id: 'kathmandu', name: 'Kathmandu',    country: 'Nepal',       tz: 'Asia/Kathmandu', lon:  85.324, group: 'South & Southeast Asia' },
  { id: 'colombo',   name: 'Colombo',      country: 'Sri Lanka',   tz: 'Asia/Colombo',   lon:  79.861, group: 'South & Southeast Asia' },

  { id: 'dubai',     name: 'Dubai',        country: 'UAE',         tz: 'Asia/Dubai',     lon:  55.270, group: 'Middle East & Central Asia' },
  { id: 'riyadh',    name: 'Riyadh',       country: 'Saudi Arabia', tz: 'Asia/Riyadh',   lon:  46.676, group: 'Middle East & Central Asia' },
  { id: 'doha',      name: 'Doha',         country: 'Qatar',       tz: 'Asia/Qatar',     lon:  51.531, group: 'Middle East & Central Asia' },
  { id: 'tehran',    name: 'Tehran',       country: 'Iran',        tz: 'Asia/Tehran',    lon:  51.389, group: 'Middle East & Central Asia' },
  { id: 'baghdad',   name: 'Baghdad',      country: 'Iraq',        tz: 'Asia/Baghdad',   lon:  44.361, group: 'Middle East & Central Asia' },
  { id: 'telaviv',   name: 'Tel Aviv',     country: 'Israel',      tz: 'Asia/Jerusalem', lon:  34.781, group: 'Middle East & Central Asia' },
  { id: 'amman',     name: 'Amman',        country: 'Jordan',      tz: 'Asia/Amman',     lon:  35.930, group: 'Middle East & Central Asia' },
  { id: 'beirut',    name: 'Beirut',       country: 'Lebanon',     tz: 'Asia/Beirut',    lon:  35.495, group: 'Middle East & Central Asia' },
  { id: 'tashkent',  name: 'Tashkent',     country: 'Uzbekistan',  tz: 'Asia/Tashkent',  lon:  69.240, group: 'Middle East & Central Asia' },
  { id: 'almaty',    name: 'Almaty',       country: 'Kazakhstan',  tz: 'Asia/Almaty',    lon:  76.886, group: 'Middle East & Central Asia' },
  { id: 'kabul',     name: 'Kabul',        country: 'Afghanistan', tz: 'Asia/Kabul',     lon:  69.208, group: 'Middle East & Central Asia' },

  { id: 'london',    name: 'London',       country: 'United Kingdom', tz: 'Europe/London', lon:  -0.128, group: 'Europe' },
  { id: 'manchester', name: 'Manchester',  country: 'United Kingdom', tz: 'Europe/London', lon:  -2.244, group: 'Europe' },
  { id: 'edinburgh', name: 'Edinburgh',    country: 'United Kingdom', tz: 'Europe/London', lon:  -3.189, group: 'Europe' },
  { id: 'dublin',    name: 'Dublin',       country: 'Ireland',     tz: 'Europe/Dublin',  lon:  -6.260, group: 'Europe' },
  { id: 'paris',     name: 'Paris',        country: 'France',      tz: 'Europe/Paris',   lon:   2.352, group: 'Europe' },
  { id: 'marseille', name: 'Marseille',    country: 'France',      tz: 'Europe/Paris',   lon:   5.370, group: 'Europe' },
  { id: 'berlin',    name: 'Berlin',       country: 'Germany',     tz: 'Europe/Berlin',  lon:  13.405, group: 'Europe' },
  { id: 'munich',    name: 'Munich',       country: 'Germany',     tz: 'Europe/Berlin',  lon:  11.582, group: 'Europe' },
  { id: 'frankfurt', name: 'Frankfurt',    country: 'Germany',     tz: 'Europe/Berlin',  lon:   8.682, group: 'Europe' },
  { id: 'amsterdam', name: 'Amsterdam',    country: 'Netherlands', tz: 'Europe/Amsterdam', lon: 4.904, group: 'Europe' },
  { id: 'brussels',  name: 'Brussels',     country: 'Belgium',     tz: 'Europe/Brussels', lon:  4.352, group: 'Europe' },
  { id: 'zurich',    name: 'Zurich',       country: 'Switzerland', tz: 'Europe/Zurich',  lon:   8.541, group: 'Europe' },
  { id: 'vienna',    name: 'Vienna',       country: 'Austria',     tz: 'Europe/Vienna',  lon:  16.373, group: 'Europe' },
  { id: 'madrid',    name: 'Madrid',       country: 'Spain',       tz: 'Europe/Madrid',  lon:  -3.703, group: 'Europe' },
  { id: 'barcelona', name: 'Barcelona',    country: 'Spain',       tz: 'Europe/Madrid',  lon:   2.173, group: 'Europe' },
  { id: 'lisbon',    name: 'Lisbon',       country: 'Portugal',    tz: 'Europe/Lisbon',  lon:  -9.139, group: 'Europe' },
  { id: 'rome',      name: 'Rome',         country: 'Italy',       tz: 'Europe/Rome',    lon:  12.496, group: 'Europe' },
  { id: 'milan',     name: 'Milan',        country: 'Italy',       tz: 'Europe/Rome',    lon:   9.190, group: 'Europe' },
  { id: 'athens',    name: 'Athens',       country: 'Greece',      tz: 'Europe/Athens',  lon:  23.728, group: 'Europe' },
  { id: 'stockholm', name: 'Stockholm',    country: 'Sweden',      tz: 'Europe/Stockholm', lon: 18.069, group: 'Europe' },
  { id: 'oslo',      name: 'Oslo',         country: 'Norway',      tz: 'Europe/Oslo',    lon:  10.752, group: 'Europe' },
  { id: 'copenhagen', name: 'Copenhagen',  country: 'Denmark',     tz: 'Europe/Copenhagen', lon: 12.568, group: 'Europe' },
  { id: 'helsinki',  name: 'Helsinki',     country: 'Finland',     tz: 'Europe/Helsinki', lon: 24.938, group: 'Europe' },
  { id: 'warsaw',    name: 'Warsaw',       country: 'Poland',      tz: 'Europe/Warsaw',  lon:  21.012, group: 'Europe' },
  { id: 'prague',    name: 'Prague',       country: 'Czechia',     tz: 'Europe/Prague',  lon:  14.438, group: 'Europe' },
  { id: 'budapest',  name: 'Budapest',     country: 'Hungary',     tz: 'Europe/Budapest', lon: 19.040, group: 'Europe' },
  { id: 'bucharest', name: 'Bucharest',    country: 'Romania',     tz: 'Europe/Bucharest', lon: 26.103, group: 'Europe' },
  { id: 'kyiv',      name: 'Kyiv',         country: 'Ukraine',     tz: 'Europe/Kyiv',    lon:  30.524, group: 'Europe' },
  { id: 'istanbul',  name: 'Istanbul',     country: 'Türkiye',     tz: 'Europe/Istanbul', lon: 28.979, group: 'Europe' },
  { id: 'moscow',    name: 'Moscow',       country: 'Russia',      tz: 'Europe/Moscow',  lon:  37.618, group: 'Europe' },
  { id: 'stpetersburg', name: 'St Petersburg', country: 'Russia',  tz: 'Europe/Moscow',  lon:  30.336, group: 'Europe' },
  { id: 'novosibirsk', name: 'Novosibirsk', country: 'Russia',     tz: 'Asia/Novosibirsk', lon: 82.920, group: 'Europe' },
  { id: 'vladivostok', name: 'Vladivostok', country: 'Russia',     tz: 'Asia/Vladivostok', lon: 131.886, group: 'Europe' },

  { id: 'cairo',     name: 'Cairo',        country: 'Egypt',       tz: 'Africa/Cairo',   lon:  31.236, group: 'Africa' },
  { id: 'lagos',     name: 'Lagos',        country: 'Nigeria',     tz: 'Africa/Lagos',   lon:   3.379, group: 'Africa' },
  { id: 'abuja',     name: 'Abuja',        country: 'Nigeria',     tz: 'Africa/Lagos',   lon:   7.491, group: 'Africa' },
  { id: 'accra',     name: 'Accra',        country: 'Ghana',       tz: 'Africa/Accra',   lon:  -0.187, group: 'Africa' },
  { id: 'nairobi',   name: 'Nairobi',      country: 'Kenya',       tz: 'Africa/Nairobi', lon:  36.817, group: 'Africa' },
  { id: 'addisababa', name: 'Addis Ababa', country: 'Ethiopia',    tz: 'Africa/Addis_Ababa', lon: 38.746, group: 'Africa' },
  { id: 'kampala',   name: 'Kampala',      country: 'Uganda',      tz: 'Africa/Kampala', lon:  32.582, group: 'Africa' },
  { id: 'daressalaam', name: 'Dar es Salaam', country: 'Tanzania', tz: 'Africa/Dar_es_Salaam', lon: 39.208, group: 'Africa' },
  { id: 'johannesburg', name: 'Johannesburg', country: 'South Africa', tz: 'Africa/Johannesburg', lon: 28.034, group: 'Africa' },
  { id: 'capetown',  name: 'Cape Town',    country: 'South Africa', tz: 'Africa/Johannesburg', lon: 18.424, group: 'Africa' },
  { id: 'casablanca', name: 'Casablanca',  country: 'Morocco',     tz: 'Africa/Casablanca', lon: -7.590, group: 'Africa' },
  { id: 'algiers',   name: 'Algiers',      country: 'Algeria',     tz: 'Africa/Algiers', lon:   3.059, group: 'Africa' },
  { id: 'tunis',     name: 'Tunis',        country: 'Tunisia',     tz: 'Africa/Tunis',   lon:  10.181, group: 'Africa' },
  { id: 'dakar',     name: 'Dakar',        country: 'Senegal',     tz: 'Africa/Dakar',   lon: -17.447, group: 'Africa' },
  { id: 'kinshasa',  name: 'Kinshasa',     country: 'DR Congo',    tz: 'Africa/Kinshasa', lon: 15.266, group: 'Africa' },
  { id: 'harare',    name: 'Harare',       country: 'Zimbabwe',    tz: 'Africa/Harare',  lon:  31.053, group: 'Africa' },

  { id: 'newyork',   name: 'New York',     country: 'United States', tz: 'America/New_York', lon: -74.006, group: 'North America' },
  { id: 'boston',    name: 'Boston',       country: 'United States', tz: 'America/New_York', lon: -71.058, group: 'North America' },
  { id: 'washington', name: 'Washington DC', country: 'United States', tz: 'America/New_York', lon: -77.037, group: 'North America' },
  { id: 'philadelphia', name: 'Philadelphia', country: 'United States', tz: 'America/New_York', lon: -75.165, group: 'North America' },
  { id: 'atlanta',   name: 'Atlanta',      country: 'United States', tz: 'America/New_York', lon: -84.388, group: 'North America' },
  { id: 'miami',     name: 'Miami',        country: 'United States', tz: 'America/New_York', lon: -80.192, group: 'North America' },
  { id: 'detroit',   name: 'Detroit',      country: 'United States', tz: 'America/Detroit',  lon: -83.046, group: 'North America' },
  { id: 'chicago',   name: 'Chicago',      country: 'United States', tz: 'America/Chicago',  lon: -87.630, group: 'North America' },
  { id: 'houston',   name: 'Houston',      country: 'United States', tz: 'America/Chicago',  lon: -95.370, group: 'North America' },
  { id: 'dallas',    name: 'Dallas',       country: 'United States', tz: 'America/Chicago',  lon: -96.797, group: 'North America' },
  { id: 'minneapolis', name: 'Minneapolis', country: 'United States', tz: 'America/Chicago', lon: -93.265, group: 'North America' },
  { id: 'denver',    name: 'Denver',       country: 'United States', tz: 'America/Denver',   lon: -104.991, group: 'North America' },
  { id: 'phoenix',   name: 'Phoenix',      country: 'United States', tz: 'America/Phoenix',  lon: -112.074, group: 'North America' },
  { id: 'losangeles', name: 'Los Angeles', country: 'United States', tz: 'America/Los_Angeles', lon: -118.244, group: 'North America' },
  { id: 'sanfrancisco', name: 'San Francisco', country: 'United States', tz: 'America/Los_Angeles', lon: -122.419, group: 'North America' },
  { id: 'seattle',   name: 'Seattle',      country: 'United States', tz: 'America/Los_Angeles', lon: -122.332, group: 'North America' },
  { id: 'sandiego',  name: 'San Diego',    country: 'United States', tz: 'America/Los_Angeles', lon: -117.161, group: 'North America' },
  { id: 'anchorage', name: 'Anchorage',    country: 'United States', tz: 'America/Anchorage', lon: -149.900, group: 'North America' },
  { id: 'honolulu',  name: 'Honolulu',     country: 'United States', tz: 'Pacific/Honolulu', lon: -157.858, group: 'North America' },
  { id: 'toronto',   name: 'Toronto',      country: 'Canada',      tz: 'America/Toronto',  lon: -79.383, group: 'North America' },
  { id: 'montreal',  name: 'Montreal',     country: 'Canada',      tz: 'America/Toronto',  lon: -73.568, group: 'North America' },
  { id: 'vancouver', name: 'Vancouver',    country: 'Canada',      tz: 'America/Vancouver', lon: -123.121, group: 'North America' },
  { id: 'calgary',   name: 'Calgary',      country: 'Canada',      tz: 'America/Edmonton', lon: -114.071, group: 'North America' },
  { id: 'mexicocity', name: 'Mexico City', country: 'Mexico',      tz: 'America/Mexico_City', lon: -99.133, group: 'North America' },
  { id: 'guadalajara', name: 'Guadalajara', country: 'Mexico',     tz: 'America/Mexico_City', lon: -103.350, group: 'North America' },
  { id: 'tijuana',   name: 'Tijuana',      country: 'Mexico',      tz: 'America/Tijuana',  lon: -117.004, group: 'North America' },

  { id: 'saopaulo',  name: 'São Paulo',    country: 'Brazil',      tz: 'America/Sao_Paulo', lon: -46.633, group: 'Latin America' },
  { id: 'riodejaneiro', name: 'Rio de Janeiro', country: 'Brazil', tz: 'America/Sao_Paulo', lon: -43.173, group: 'Latin America' },
  { id: 'brasilia',  name: 'Brasília',     country: 'Brazil',      tz: 'America/Sao_Paulo', lon: -47.883, group: 'Latin America' },
  { id: 'buenosaires', name: 'Buenos Aires', country: 'Argentina', tz: 'America/Argentina/Buenos_Aires', lon: -58.382, group: 'Latin America' },
  { id: 'santiago',  name: 'Santiago',     country: 'Chile',       tz: 'America/Santiago', lon: -70.670, group: 'Latin America' },
  { id: 'lima',      name: 'Lima',         country: 'Peru',        tz: 'America/Lima',     lon: -77.043, group: 'Latin America' },
  { id: 'bogota',    name: 'Bogotá',       country: 'Colombia',    tz: 'America/Bogota',   lon: -74.072, group: 'Latin America' },
  { id: 'caracas',   name: 'Caracas',      country: 'Venezuela',   tz: 'America/Caracas',  lon: -66.904, group: 'Latin America' },
  { id: 'quito',     name: 'Quito',        country: 'Ecuador',     tz: 'America/Guayaquil', lon: -78.467, group: 'Latin America' },
  { id: 'lapaz',     name: 'La Paz',       country: 'Bolivia',     tz: 'America/La_Paz',   lon: -68.150, group: 'Latin America' },
  { id: 'montevideo', name: 'Montevideo',  country: 'Uruguay',     tz: 'America/Montevideo', lon: -56.182, group: 'Latin America' },
  { id: 'havana',    name: 'Havana',       country: 'Cuba',        tz: 'America/Havana',   lon: -82.366, group: 'Latin America' },
  { id: 'sanjuan',   name: 'San Juan',     country: 'Puerto Rico', tz: 'America/Puerto_Rico', lon: -66.106, group: 'Latin America' },
  { id: 'santodomingo', name: 'Santo Domingo', country: 'Dominican Republic', tz: 'America/Santo_Domingo', lon: -69.929, group: 'Latin America' },
  { id: 'guatemala', name: 'Guatemala City', country: 'Guatemala', tz: 'America/Guatemala', lon: -90.513, group: 'Latin America' },
  { id: 'panama',    name: 'Panama City',  country: 'Panama',      tz: 'America/Panama',   lon: -79.516, group: 'Latin America' },

  { id: 'sydney',    name: 'Sydney',       country: 'Australia',   tz: 'Australia/Sydney',    lon: 151.209, group: 'Oceania' },
  { id: 'melbourne', name: 'Melbourne',    country: 'Australia',   tz: 'Australia/Melbourne', lon: 144.963, group: 'Oceania' },
  { id: 'brisbane',  name: 'Brisbane',     country: 'Australia',   tz: 'Australia/Brisbane',  lon: 153.025, group: 'Oceania' },
  { id: 'perth',     name: 'Perth',        country: 'Australia',   tz: 'Australia/Perth',     lon: 115.857, group: 'Oceania' },
  { id: 'adelaide',  name: 'Adelaide',     country: 'Australia',   tz: 'Australia/Adelaide',  lon: 138.600, group: 'Oceania' },
  { id: 'canberra',  name: 'Canberra',     country: 'Australia',   tz: 'Australia/Sydney',    lon: 149.128, group: 'Oceania' },
  { id: 'auckland',  name: 'Auckland',     country: 'New Zealand', tz: 'Pacific/Auckland',    lon: 174.764, group: 'Oceania' },
  { id: 'wellington', name: 'Wellington',  country: 'New Zealand', tz: 'Pacific/Auckland',    lon: 174.776, group: 'Oceania' },
  { id: 'suva',      name: 'Suva',         country: 'Fiji',        tz: 'Pacific/Fiji',        lon: 178.442, group: 'Oceania' },
  { id: 'portmoresby', name: 'Port Moresby', country: 'Papua New Guinea', tz: 'Pacific/Port_Moresby', lon: 147.180, group: 'Oceania' },
];

export const PLACE_GROUPS = [
  'Korea',
  'East Asia',
  'South & Southeast Asia',
  'Middle East & Central Asia',
  'Europe',
  'Africa',
  'North America',
  'Latin America',
  'Oceania',
];

/**
 * A sensible default for the birthplace dropdown.
 *
 * Most people are born somewhere near where they now live, so the browser's own
 * timezone is a better first guess than Seoul. Prefers an exact IANA match, then
 * falls back to any city sharing the same UTC offset today, then to Seoul.
 */
export function detectPlace(fallbackId = 'seoul') {
  let zone;
  try {
    zone = Intl.DateTimeFormat().resolvedOptions().timeZone;
  } catch {
    return fallbackId;
  }
  if (!zone) return fallbackId;

  const exact = PLACES.find((p) => p.tz === zone);
  if (exact) return exact.id;

  // No city on that exact zone -- settle for one on the same offset right now.
  try {
    const now = new Date();
    const target = offsetAtInstant(zone, now);
    const sameOffset = PLACES.find((p) => offsetAtInstant(p.tz, now) === target);
    if (sameOffset) return sameOffset.id;
  } catch {
    /* fall through */
  }

  return fallbackId;
}

export function findPlace(id) {
  return PLACES.find((p) => p.id === id) ?? PLACES[0];
}

/**
 * The UTC offset a timezone was using at a given UTC instant, in hours.
 * Reads IANA tzdata through Intl, so historical shifts and long-abolished
 * summer times are all included.
 */
function offsetAtInstant(timeZone, date) {
  const name = new Intl.DateTimeFormat('en-US', { timeZone, timeZoneName: 'longOffset' })
    .formatToParts(date)
    .find((p) => p.type === 'timeZoneName').value; // e.g. "GMT+09:00", or "GMT"

  const match = /GMT([+-])(\d{2}):?(\d{2})?/.exec(name);
  if (!match) return 0; // bare "GMT"
  const sign = match[1] === '-' ? -1 : 1;
  return sign * (Number(match[2]) + Number(match[3] ?? 0) / 60);
}

/**
 * The UTC offset in force for a *local wall-clock* time.
 *
 * This is circular -- you need the offset to turn local time into an instant,
 * and the instant to look up the offset. Two passes settle it for every case
 * except the one ambiguous hour when clocks go back, where either answer is
 * defensible and the difference does not reach the hour pillar.
 */
export function resolveUtcOffset(timeZone, year, month, day, hour = 12, minute = 0) {
  const asUtc = Date.UTC(year, month - 1, day, hour, minute);
  let offset = offsetAtInstant(timeZone, new Date(asUtc));
  offset = offsetAtInstant(timeZone, new Date(asUtc - offset * 3600000));
  return offset;
}

/**
 * Turn a form submission into the `birth` object the engine wants.
 *
 * @param {object} input
 * @param {string} input.date   "YYYY-MM-DD"
 * @param {string} [input.time] "HH:MM"
 * @param {string} input.placeId
 * @param {boolean} [input.timeUnknown]
 */
export function buildBirth({ date, time, placeId, timeUnknown = false }) {
  const [year, month, day] = date.split('-').map(Number);
  const [hour, minute] = timeUnknown || !time
    ? [12, 0]
    : time.split(':').map(Number);

  const place = findPlace(placeId);
  const utcOffset = resolveUtcOffset(place.tz, year, month, day, hour, minute);

  return {
    birth: { year, month, day, hour, minute, utcOffset, longitude: place.lon, timeUnknown },
    place,
    utcOffset,
  };
}

/** "UTC+9", "UTC+8:30", "UTC-5" -- for showing the user what we assumed. */
export function formatOffset(offset) {
  const sign = offset < 0 ? '-' : '+';
  const abs = Math.abs(offset);
  const h = Math.floor(abs);
  const m = Math.round((abs - h) * 60);
  return `UTC${sign}${h}${m ? ':' + String(m).padStart(2, '0') : ''}`;
}
