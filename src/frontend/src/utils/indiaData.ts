export interface IndiaCity {
  name: string;
  pincode: string;
}

export interface IndiaState {
  name: string;
  cities: IndiaCity[];
}

export const INDIA_STATES: IndiaState[] = [
  {
    name: "Andhra Pradesh",
    cities: [
      { name: "Visakhapatnam", pincode: "530001" },
      { name: "Vijayawada", pincode: "520001" },
      { name: "Guntur", pincode: "522001" },
      { name: "Nellore", pincode: "524001" },
      { name: "Kurnool", pincode: "518001" },
      { name: "Tirupati", pincode: "517001" },
      { name: "Rajahmundry", pincode: "533101" },
      { name: "Kakinada", pincode: "533001" },
    ],
  },
  {
    name: "Arunachal Pradesh",
    cities: [
      { name: "Itanagar", pincode: "791111" },
      { name: "Naharlagun", pincode: "791110" },
      { name: "Pasighat", pincode: "791102" },
      { name: "Tezpur", pincode: "784001" },
    ],
  },
  {
    name: "Assam",
    cities: [
      { name: "Guwahati", pincode: "781001" },
      { name: "Dibrugarh", pincode: "786001" },
      { name: "Silchar", pincode: "788001" },
      { name: "Jorhat", pincode: "785001" },
      { name: "Tezpur", pincode: "784001" },
      { name: "Nagaon", pincode: "782001" },
    ],
  },
  {
    name: "Bihar",
    cities: [
      { name: "Patna", pincode: "800001" },
      { name: "Gaya", pincode: "823001" },
      { name: "Muzaffarpur", pincode: "842001" },
      { name: "Bhagalpur", pincode: "812001" },
      { name: "Darbhanga", pincode: "846001" },
      { name: "Purnia", pincode: "854301" },
      { name: "Ara", pincode: "802301" },
    ],
  },
  {
    name: "Chhattisgarh",
    cities: [
      { name: "Raipur", pincode: "492001" },
      { name: "Bhilai", pincode: "490001" },
      { name: "Bilaspur", pincode: "495001" },
      { name: "Durg", pincode: "491001" },
      { name: "Korba", pincode: "495677" },
      { name: "Rajnandgaon", pincode: "491441" },
    ],
  },
  {
    name: "Goa",
    cities: [
      { name: "Panaji", pincode: "403001" },
      { name: "Margao", pincode: "403601" },
      { name: "Vasco da Gama", pincode: "403802" },
      { name: "Mapusa", pincode: "403507" },
      { name: "Ponda", pincode: "403401" },
    ],
  },
  {
    name: "Gujarat",
    cities: [
      { name: "Ahmedabad", pincode: "380001" },
      { name: "Surat", pincode: "395001" },
      { name: "Vadodara", pincode: "390001" },
      { name: "Rajkot", pincode: "360001" },
      { name: "Bhavnagar", pincode: "364001" },
      { name: "Jamnagar", pincode: "361001" },
      { name: "Gandhinagar", pincode: "382010" },
      { name: "Anand", pincode: "388001" },
    ],
  },
  {
    name: "Haryana",
    cities: [
      { name: "Faridabad", pincode: "121001" },
      { name: "Gurgaon", pincode: "122001" },
      { name: "Panipat", pincode: "132103" },
      { name: "Ambala", pincode: "133001" },
      { name: "Yamunanagar", pincode: "135001" },
      { name: "Rohtak", pincode: "124001" },
      { name: "Hisar", pincode: "125001" },
      { name: "Karnal", pincode: "132001" },
    ],
  },
  {
    name: "Himachal Pradesh",
    cities: [
      { name: "Shimla", pincode: "171001" },
      { name: "Dharamshala", pincode: "176215" },
      { name: "Solan", pincode: "173212" },
      { name: "Mandi", pincode: "175001" },
      { name: "Kullu", pincode: "175101" },
      { name: "Manali", pincode: "175131" },
    ],
  },
  {
    name: "Jharkhand",
    cities: [
      { name: "Ranchi", pincode: "834001" },
      { name: "Jamshedpur", pincode: "831001" },
      { name: "Dhanbad", pincode: "826001" },
      { name: "Bokaro", pincode: "827001" },
      { name: "Deoghar", pincode: "814112" },
      { name: "Hazaribagh", pincode: "825301" },
    ],
  },
  {
    name: "Karnataka",
    cities: [
      { name: "Bangalore", pincode: "560001" },
      { name: "Mysore", pincode: "570001" },
      { name: "Hubli", pincode: "580001" },
      { name: "Mangalore", pincode: "575001" },
      { name: "Belgaum", pincode: "590001" },
      { name: "Davangere", pincode: "577001" },
      { name: "Bellary", pincode: "583101" },
      { name: "Shimoga", pincode: "577201" },
    ],
  },
  {
    name: "Kerala",
    cities: [
      { name: "Thiruvananthapuram", pincode: "695001" },
      { name: "Kochi", pincode: "682001" },
      { name: "Kozhikode", pincode: "673001" },
      { name: "Thrissur", pincode: "680001" },
      { name: "Kollam", pincode: "691001" },
      { name: "Kannur", pincode: "670001" },
      { name: "Palakkad", pincode: "678001" },
    ],
  },
  {
    name: "Madhya Pradesh",
    cities: [
      { name: "Bhopal", pincode: "462001" },
      { name: "Indore", pincode: "452001" },
      { name: "Jabalpur", pincode: "482001" },
      { name: "Gwalior", pincode: "474001" },
      { name: "Ujjain", pincode: "456001" },
      { name: "Sagar", pincode: "470001" },
      { name: "Dewas", pincode: "455001" },
      { name: "Ratlam", pincode: "457001" },
    ],
  },
  {
    name: "Maharashtra",
    cities: [
      { name: "Mumbai", pincode: "400001" },
      { name: "Pune", pincode: "411001" },
      { name: "Nagpur", pincode: "440001" },
      { name: "Nashik", pincode: "422001" },
      { name: "Aurangabad", pincode: "431001" },
      { name: "Solapur", pincode: "413001" },
      { name: "Kolhapur", pincode: "416001" },
      { name: "Thane", pincode: "400601" },
      { name: "Navi Mumbai", pincode: "400701" },
    ],
  },
  {
    name: "Manipur",
    cities: [
      { name: "Imphal", pincode: "795001" },
      { name: "Bishnupur", pincode: "795126" },
      { name: "Thoubal", pincode: "795138" },
    ],
  },
  {
    name: "Meghalaya",
    cities: [
      { name: "Shillong", pincode: "793001" },
      { name: "Tura", pincode: "794001" },
      { name: "Jowai", pincode: "793150" },
    ],
  },
  {
    name: "Mizoram",
    cities: [
      { name: "Aizawl", pincode: "796001" },
      { name: "Lunglei", pincode: "796701" },
      { name: "Champhai", pincode: "796321" },
    ],
  },
  {
    name: "Nagaland",
    cities: [
      { name: "Kohima", pincode: "797001" },
      { name: "Dimapur", pincode: "797112" },
      { name: "Mokokchung", pincode: "798601" },
    ],
  },
  {
    name: "Odisha",
    cities: [
      { name: "Bhubaneswar", pincode: "751001" },
      { name: "Cuttack", pincode: "753001" },
      { name: "Rourkela", pincode: "769001" },
      { name: "Brahmapur", pincode: "760001" },
      { name: "Sambalpur", pincode: "768001" },
      { name: "Puri", pincode: "752001" },
    ],
  },
  {
    name: "Punjab",
    cities: [
      { name: "Ludhiana", pincode: "141001" },
      { name: "Amritsar", pincode: "143001" },
      { name: "Jalandhar", pincode: "144001" },
      { name: "Patiala", pincode: "147001" },
      { name: "Bathinda", pincode: "151001" },
      { name: "Mohali", pincode: "160055" },
      { name: "Pathankot", pincode: "145001" },
    ],
  },
  {
    name: "Rajasthan",
    cities: [
      { name: "Jaipur", pincode: "302001" },
      { name: "Jodhpur", pincode: "342001" },
      { name: "Kota", pincode: "324001" },
      { name: "Bikaner", pincode: "334001" },
      { name: "Ajmer", pincode: "305001" },
      { name: "Udaipur", pincode: "313001" },
      { name: "Bharatpur", pincode: "321001" },
      { name: "Alwar", pincode: "301001" },
    ],
  },
  {
    name: "Sikkim",
    cities: [
      { name: "Gangtok", pincode: "737101" },
      { name: "Namchi", pincode: "737126" },
      { name: "Gyalshing", pincode: "737111" },
    ],
  },
  {
    name: "Tamil Nadu",
    cities: [
      { name: "Chennai", pincode: "600001" },
      { name: "Coimbatore", pincode: "641001" },
      { name: "Madurai", pincode: "625001" },
      { name: "Trichy", pincode: "620001" },
      { name: "Salem", pincode: "636001" },
      { name: "Tirunelveli", pincode: "627001" },
      { name: "Tiruppur", pincode: "641601" },
      { name: "Vellore", pincode: "632001" },
      { name: "Erode", pincode: "638001" },
    ],
  },
  {
    name: "Telangana",
    cities: [
      { name: "Hyderabad", pincode: "500001" },
      { name: "Warangal", pincode: "506001" },
      { name: "Nizamabad", pincode: "503001" },
      { name: "Karimnagar", pincode: "505001" },
      { name: "Khammam", pincode: "507001" },
      { name: "Secunderabad", pincode: "500003" },
    ],
  },
  {
    name: "Tripura",
    cities: [
      { name: "Agartala", pincode: "799001" },
      { name: "Dharmanagar", pincode: "799253" },
      { name: "Udaipur", pincode: "799120" },
    ],
  },
  {
    name: "Uttar Pradesh",
    cities: [
      { name: "Lucknow", pincode: "226001" },
      { name: "Kanpur", pincode: "208001" },
      { name: "Agra", pincode: "282001" },
      { name: "Varanasi", pincode: "221001" },
      { name: "Allahabad", pincode: "211001" },
      { name: "Meerut", pincode: "250001" },
      { name: "Noida", pincode: "201301" },
      { name: "Ghaziabad", pincode: "201001" },
      { name: "Mathura", pincode: "281001" },
      { name: "Bareilly", pincode: "243001" },
      { name: "Aligarh", pincode: "202001" },
      { name: "Moradabad", pincode: "244001" },
      { name: "Saharanpur", pincode: "247001" },
      { name: "Gorakhpur", pincode: "273001" },
      { name: "Firozabad", pincode: "283203" },
    ],
  },
  {
    name: "Uttarakhand",
    cities: [
      { name: "Dehradun", pincode: "248001" },
      { name: "Haridwar", pincode: "249401" },
      { name: "Roorkee", pincode: "247667" },
      { name: "Haldwani", pincode: "263139" },
      { name: "Nainital", pincode: "263001" },
      { name: "Rishikesh", pincode: "249201" },
    ],
  },
  {
    name: "West Bengal",
    cities: [
      { name: "Kolkata", pincode: "700001" },
      { name: "Asansol", pincode: "713301" },
      { name: "Siliguri", pincode: "734001" },
      { name: "Durgapur", pincode: "713201" },
      { name: "Howrah", pincode: "711101" },
      { name: "Bardhaman", pincode: "713101" },
      { name: "Kharagpur", pincode: "721301" },
      { name: "Malda", pincode: "732101" },
    ],
  },
  // Union Territories
  {
    name: "Andaman and Nicobar Islands",
    cities: [
      { name: "Port Blair", pincode: "744101" },
      { name: "Havelock Island", pincode: "744211" },
    ],
  },
  {
    name: "Chandigarh",
    cities: [
      { name: "Chandigarh", pincode: "160001" },
      { name: "Panchkula", pincode: "134109" },
      { name: "Mohali", pincode: "160059" },
    ],
  },
  {
    name: "Dadra and Nagar Haveli",
    cities: [
      { name: "Silvassa", pincode: "396230" },
      { name: "Amli", pincode: "396230" },
    ],
  },
  {
    name: "Daman and Diu",
    cities: [
      { name: "Daman", pincode: "396210" },
      { name: "Diu", pincode: "362520" },
    ],
  },
  {
    name: "Delhi",
    cities: [
      { name: "New Delhi", pincode: "110001" },
      { name: "South Delhi", pincode: "110017" },
      { name: "North Delhi", pincode: "110006" },
      { name: "East Delhi", pincode: "110031" },
      { name: "West Delhi", pincode: "110063" },
      { name: "Dwarka", pincode: "110075" },
      { name: "Rohini", pincode: "110085" },
      { name: "Saket", pincode: "110017" },
      { name: "Connaught Place", pincode: "110001" },
    ],
  },
  {
    name: "Jammu and Kashmir",
    cities: [
      { name: "Srinagar", pincode: "190001" },
      { name: "Jammu", pincode: "180001" },
      { name: "Sopore", pincode: "193201" },
      { name: "Anantnag", pincode: "192101" },
    ],
  },
  {
    name: "Ladakh",
    cities: [
      { name: "Leh", pincode: "194101" },
      { name: "Kargil", pincode: "194103" },
    ],
  },
  {
    name: "Lakshadweep",
    cities: [
      { name: "Kavaratti", pincode: "682555" },
      { name: "Andrott", pincode: "682551" },
    ],
  },
  {
    name: "Puducherry",
    cities: [
      { name: "Puducherry", pincode: "605001" },
      { name: "Karaikal", pincode: "609601" },
      { name: "Mahe", pincode: "673310" },
    ],
  },
];
