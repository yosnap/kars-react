// Datos de marcas para importación
// Generado automáticamente desde la API de motoraldia.net
// Última actualización: 2025-07-27T01:38:15.399Z

export interface BrandData {
  value: string;
  label: string;
}

export interface BrandsData {
  metadata: {
    createdAt: string;
    totalCarBrands: number;
    totalMotorcycleBrands: number;
    duplicateBrands: number;
    duplicateBrandsList: BrandData[];
    version: string;
  };
  carBrands: BrandData[];
  motorcycleBrands: BrandData[];
}

export const brandsData: BrandsData = {
  "metadata": {
    "createdAt": "2025-07-27T01:38:15.399Z",
    "totalCarBrands": 137,
    "totalMotorcycleBrands": 140,
    "duplicateBrands": 9,
    "duplicateBrandsList": [
          {
                "value": "bmw",
                "label": "BMW"
          },
          {
                "value": "honda",
                "label": "Honda"
          },
          {
                "value": "lifan",
                "label": "Lifan"
          },
          {
                "value": "macbor",
                "label": "Macbor"
          },
          {
                "value": "peugeot",
                "label": "Peugeot"
          },
          {
                "value": "polaris",
                "label": "Polaris"
          },
          {
                "value": "silence",
                "label": "Silence"
          },
          {
                "value": "suzuki",
                "label": "Suzuki"
          },
          {
                "value": "triumph",
                "label": "Triumph"
          }
    ],
    "version": "4.0"
  },
  "carBrands": [
      {
          "value": "abarth",
          "label": "Abarth"
      },
      {
          "value": "ac",
          "label": "AC"
      },
      {
          "value": "acura",
          "label": "Acura"
      },
      {
          "value": "alfa-romeo",
          "label": "Alfa Romeo"
      },
      {
          "value": "alpina",
          "label": "Alpina"
      },
      {
          "value": "alpine",
          "label": "Alpine"
      },
      {
          "value": "aston-martin",
          "label": "Aston Martin"
      },
      {
          "value": "atlas",
          "label": "Atlas"
      },
      {
          "value": "audi",
          "label": "Audi"
      },
      {
          "value": "austin",
          "label": "Austin"
      },
      {
          "value": "autobianchi",
          "label": "Autobianchi"
      },
      {
          "value": "benimar",
          "label": "Benimar"
      },
      {
          "value": "bentley",
          "label": "Bentley"
      },
      {
          "value": "bmw",
          "label": "BMW"
      },
      {
          "value": "brabus",
          "label": "Brabus"
      },
      {
          "value": "brilliance",
          "label": "Brilliance"
      },
      {
          "value": "bugatti",
          "label": "Bugatti"
      },
      {
          "value": "buick",
          "label": "Buick"
      },
      {
          "value": "byd",
          "label": "BYD"
      },
      {
          "value": "cadillac",
          "label": "Cadillac"
      },
      {
          "value": "campster",
          "label": "Campster"
      },
      {
          "value": "caravans-wohnm",
          "label": "Caravans-Wohnm"
      },
      {
          "value": "challenger",
          "label": "Challenger"
      },
      {
          "value": "chery",
          "label": "Chery"
      },
      {
          "value": "chevrolet",
          "label": "Chevrolet"
      },
      {
          "value": "chrysler",
          "label": "Chrysler"
      },
      {
          "value": "citroen",
          "label": "Citroen"
      },
      {
          "value": "cupra",
          "label": "Cupra"
      },
      {
          "value": "dacia",
          "label": "Dacia"
      },
      {
          "value": "daewoo",
          "label": "Daewoo"
      },
      {
          "value": "daf",
          "label": "DAF"
      },
      {
          "value": "daihatsu",
          "label": "Daihatsu"
      },
      {
          "value": "derways",
          "label": "Derways"
      },
      {
          "value": "dethleffs",
          "label": "Dethleffs"
      },
      {
          "value": "dodge",
          "label": "Dodge"
      },
      {
          "value": "dr-motor",
          "label": "DR Motor"
      },
      {
          "value": "etrusco",
          "label": "Etrusco"
      },
      {
          "value": "ferrari",
          "label": "Ferrari"
      },
      {
          "value": "fiat",
          "label": "Fiat"
      },
      {
          "value": "fisker",
          "label": "Fisker"
      },
      {
          "value": "ford",
          "label": "Ford"
      },
      {
          "value": "frankia",
          "label": "Frankia"
      },
      {
          "value": "fuchs",
          "label": "Fuchs"
      },
      {
          "value": "gaz",
          "label": "GAZ"
      },
      {
          "value": "geely",
          "label": "Geely"
      },
      {
          "value": "globecar",
          "label": "Globecar"
      },
      {
          "value": "gmc",
          "label": "GMC"
      },
      {
          "value": "great-wall-motors",
          "label": "GWM"
      },
      {
          "value": "hanomag",
          "label": "Hanomag"
      },
      {
          "value": "hitachi",
          "label": "Hitachi"
      },
      {
          "value": "honda",
          "label": "Honda"
      },
      {
          "value": "hummer",
          "label": "Hummer"
      },
      {
          "value": "hymer",
          "label": "Hymer"
      },
      {
          "value": "hyundai",
          "label": "Hyundai"
      },
      {
          "value": "ineos",
          "label": "Ineos"
      },
      {
          "value": "infiniti",
          "label": "Infiniti"
      },
      {
          "value": "innocenti",
          "label": "Innocenti"
      },
      {
          "value": "isuzu",
          "label": "Isuzu"
      },
      {
          "value": "iveco",
          "label": "Iveco"
      },
      {
          "value": "iveco-magirus",
          "label": "Iveco Magirus"
      },
      {
          "value": "iveco-fiat",
          "label": "Iveco-Fiat"
      },
      {
          "value": "jaguar",
          "label": "Jaguar"
      },
      {
          "value": "jeep",
          "label": "Jeep"
      },
      {
          "value": "jollba",
          "label": "Jollba"
      },
      {
          "value": "jungheinrich",
          "label": "Jungheinrich"
      },
      {
          "value": "kgm",
          "label": "KGM"
      },
      {
          "value": "kia",
          "label": "Kia"
      },
      {
          "value": "knaus",
          "label": "Knaus"
      },
      {
          "value": "koegel",
          "label": "Koegel"
      },
      {
          "value": "koenigsegg",
          "label": "Koenigsegg"
      },
      {
          "value": "komatsu",
          "label": "Komatsu"
      },
      {
          "value": "lada",
          "label": "Lada"
      },
      {
          "value": "laika",
          "label": "Laika"
      },
      {
          "value": "lamborghini",
          "label": "Lamborghini"
      },
      {
          "value": "lancia",
          "label": "Lancia"
      },
      {
          "value": "land-rover",
          "label": "Land Rover"
      },
      {
          "value": "ldv",
          "label": "LDV"
      },
      {
          "value": "lexus",
          "label": "Lexus"
      },
      {
          "value": "lifan",
          "label": "Lifan"
      },
      {
          "value": "ligier",
          "label": "Ligier"
      },
      {
          "value": "lincoln",
          "label": "Lincoln"
      },
      {
          "value": "linde",
          "label": "Linde"
      },
      {
          "value": "lotus",
          "label": "Lotus"
      },
      {
          "value": "macbor",
          "label": "Macbor"
      },
      {
          "value": "mahindra",
          "label": "Mahindra"
      },
      {
          "value": "man",
          "label": "MAN"
      },
      {
          "value": "maserati",
          "label": "Maserati"
      },
      {
          "value": "maybach",
          "label": "Maybach"
      },
      {
          "value": "mazda",
          "label": "Mazda"
      },
      {
          "value": "mclaren",
          "label": "McLaren"
      },
      {
          "value": "mclouis",
          "label": "McLouis"
      },
      {
          "value": "mercedes-benz",
          "label": "Mercedes-Benz"
      },
      {
          "value": "mg",
          "label": "MG"
      },
      {
          "value": "microcar",
          "label": "Microcar"
      },
      {
          "value": "mini",
          "label": "MINI"
      },
      {
          "value": "mitsubishi",
          "label": "Mitsubishi"
      },
      {
          "value": "mobilvetta",
          "label": "Mobilvetta"
      },
      {
          "value": "morgan",
          "label": "Morgan"
      },
      {
          "value": "multicar",
          "label": "Multicar"
      },
      {
          "value": "neoplan",
          "label": "Neoplan"
      },
      {
          "value": "nissan",
          "label": "Nissan"
      },
      {
          "value": "opel",
          "label": "Opel"
      },
      {
          "value": "pagani",
          "label": "Pagani"
      },
      {
          "value": "peugeot",
          "label": "Peugeot"
      },
      {
          "value": "polaris",
          "label": "Polaris"
      },
      {
          "value": "pontiac",
          "label": "Pontiac"
      },
      {
          "value": "porsche",
          "label": "Porsche"
      },
      {
          "value": "renault",
          "label": "Renault"
      },
      {
          "value": "roller-team",
          "label": "Roller Team"
      },
      {
          "value": "rolls-royce",
          "label": "Rolls-Royce"
      },
      {
          "value": "rover",
          "label": "Rover"
      },
      {
          "value": "scania",
          "label": "Scania"
      },
      {
          "value": "schaeff",
          "label": "Schaeff"
      },
      {
          "value": "seat",
          "label": "Seat"
      },
      {
          "value": "silence",
          "label": "Silence"
      },
      {
          "value": "skoda",
          "label": "Skoda"
      },
      {
          "value": "smart",
          "label": "Smart"
      },
      {
          "value": "spyker",
          "label": "Spyker"
      },
      {
          "value": "ssangyong",
          "label": "SsangYong"
      },
      {
          "value": "subaru",
          "label": "Subaru"
      },
      {
          "value": "sunlight",
          "label": "Sunlight"
      },
      {
          "value": "suzuki",
          "label": "Suzuki"
      },
      {
          "value": "tata",
          "label": "TATA"
      },
      {
          "value": "tesla",
          "label": "Tesla"
      },
      {
          "value": "toyota",
          "label": "Toyota"
      },
      {
          "value": "triumph",
          "label": "Triumph"
      },
      {
          "value": "tvr",
          "label": "TVR"
      },
      {
          "value": "uaz",
          "label": "UAZ"
      },
      {
          "value": "volkswagen",
          "label": "Volkswagen"
      },
      {
          "value": "volvo",
          "label": "Volvo"
      },
      {
          "value": "vortex",
          "label": "Vortex"
      },
      {
          "value": "weinsberg",
          "label": "Weinsberg"
      },
      {
          "value": "westfalia",
          "label": "Westfalia"
      },
      {
          "value": "wiesmann",
          "label": "Wiesmann"
      },
      {
          "value": "xev",
          "label": "XEV"
      },
      {
          "value": "zeppelin",
          "label": "Zeppelin"
      },
      {
          "value": "zettelmeyer",
          "label": "Zettelmeyer"
      }
  ],
  "motorcycleBrands": [
      {
          "value": "a-t-u",
          "label": "A.T.U."
      },
      {
          "value": "agm",
          "label": "AGM"
      },
      {
          "value": "aprilia",
          "label": "Aprilia"
      },
      {
          "value": "arctic-cat",
          "label": "Arctic Cat"
      },
      {
          "value": "baotian",
          "label": "Baotian"
      },
      {
          "value": "barossa",
          "label": "Barossa"
      },
      {
          "value": "bashan",
          "label": "Bashan"
      },
      {
          "value": "beeline",
          "label": "Beeline"
      },
      {
          "value": "benda",
          "label": "Benda"
      },
      {
          "value": "benelli",
          "label": "Benelli"
      },
      {
          "value": "benzhou",
          "label": "Benzhou"
      },
      {
          "value": "beta",
          "label": "Beta"
      },
      {
          "value": "bimota",
          "label": "Bimota"
      },
      {
          "value": "bmw",
          "label": "BMW"
      },
      {
          "value": "bombardier",
          "label": "Bombardier"
      },
      {
          "value": "borossi",
          "label": "Borossi"
      },
      {
          "value": "brammo",
          "label": "Brammo"
      },
      {
          "value": "brenda",
          "label": "Brenda"
      },
      {
          "value": "bsa",
          "label": "BSA"
      },
      {
          "value": "buell",
          "label": "Buell"
      },
      {
          "value": "bultaco",
          "label": "Bultaco"
      },
      {
          "value": "burelli",
          "label": "Burelli"
      },
      {
          "value": "cagiva",
          "label": "Cagiva"
      },
      {
          "value": "can-am",
          "label": "Can-Am"
      },
      {
          "value": "ccm",
          "label": "CCM"
      },
      {
          "value": "cfmoto",
          "label": "CF MOTO"
      },
      {
          "value": "csr",
          "label": "CSR"
      },
      {
          "value": "daelim",
          "label": "Daelim"
      },
      {
          "value": "derbi",
          "label": "Derbi"
      },
      {
          "value": "dkw",
          "label": "DKW"
      },
      {
          "value": "ducati",
          "label": "Ducati"
      },
      {
          "value": "e-atv",
          "label": "E-ATV"
      },
      {
          "value": "e-max",
          "label": "E-max"
      },
      {
          "value": "ecomobile",
          "label": "Ecomobile"
      },
      {
          "value": "elektra-bikes",
          "label": "Elektra Bikes"
      },
      {
          "value": "emco",
          "label": "Emco"
      },
      {
          "value": "emw",
          "label": "EMW"
      },
      {
          "value": "energica",
          "label": "Energica"
      },
      {
          "value": "fantic",
          "label": "Fantic"
      },
      {
          "value": "fecht-trike",
          "label": "Fecht Trike"
      },
      {
          "value": "felo",
          "label": "Felo"
      },
      {
          "value": "garelli",
          "label": "Garelli"
      },
      {
          "value": "gas-gas",
          "label": "Gas Gas"
      },
      {
          "value": "genata",
          "label": "Genata"
      },
      {
          "value": "generic",
          "label": "Generic"
      },
      {
          "value": "giantco",
          "label": "Giantco"
      },
      {
          "value": "gilera",
          "label": "Gilera"
      },
      {
          "value": "govecs",
          "label": "Govecs"
      },
      {
          "value": "hanway",
          "label": "Hanway"
      },
      {
          "value": "harley-davidson",
          "label": "Harley Davidson"
      },
      {
          "value": "heinkel",
          "label": "Heinkel"
      },
      {
          "value": "hercules",
          "label": "Hercules"
      },
      {
          "value": "hisun",
          "label": "Hisun"
      },
      {
          "value": "hm",
          "label": "HM"
      },
      {
          "value": "honda",
          "label": "Honda"
      },
      {
          "value": "horex",
          "label": "Horex"
      },
      {
          "value": "hudson-boss",
          "label": "HUDSON BOSS"
      },
      {
          "value": "husaberg",
          "label": "Husaberg"
      },
      {
          "value": "husqvarna",
          "label": "Husqvarna"
      },
      {
          "value": "hyosung",
          "label": "Hyosung"
      },
      {
          "value": "indian",
          "label": "Indian"
      },
      {
          "value": "italjet",
          "label": "Italjet"
      },
      {
          "value": "jack-fox",
          "label": "Jack Fox"
      },
      {
          "value": "jonway",
          "label": "Jonway"
      },
      {
          "value": "kawasaki",
          "label": "Kawasaki"
      },
      {
          "value": "keeway",
          "label": "Keeway"
      },
      {
          "value": "ksr-motos",
          "label": "KSR Motos"
      },
      {
          "value": "ktm",
          "label": "KTM"
      },
      {
          "value": "kymco",
          "label": "Kymco"
      },
      {
          "value": "lc-100",
          "label": "LC 100"
      },
      {
          "value": "lc-50",
          "label": "LC 50"
      },
      {
          "value": "lem",
          "label": "LEM"
      },
      {
          "value": "leonart",
          "label": "Leonart"
      },
      {
          "value": "lifan",
          "label": "Lifan"
      },
      {
          "value": "linhai",
          "label": "Linhai"
      },
      {
          "value": "lml",
          "label": "LML"
      },
      {
          "value": "luxxon",
          "label": "Luxxon"
      },
      {
          "value": "macbor",
          "label": "Macbor"
      },
      {
          "value": "maico",
          "label": "Maico"
      },
      {
          "value": "mash",
          "label": "Mash"
      },
      {
          "value": "mbk",
          "label": "MBK"
      },
      {
          "value": "mondial",
          "label": "Mondial"
      },
      {
          "value": "montesa",
          "label": "Montesa"
      },
      {
          "value": "moto-guzzi",
          "label": "Moto Guzzi"
      },
      {
          "value": "motobecane",
          "label": "Motobecane"
      },
      {
          "value": "mtr",
          "label": "MTR"
      },
      {
          "value": "mv-agusta",
          "label": "MV Agusta"
      },
      {
          "value": "next",
          "label": "Next"
      },
      {
          "value": "nitro-motors",
          "label": "Nitro Motors"
      },
      {
          "value": "norton",
          "label": "Norton"
      },
      {
          "value": "nova-motors",
          "label": "Nova Motors"
      },
      {
          "value": "nsu",
          "label": "NSU"
      },
      {
          "value": "palmo",
          "label": "Palmo"
      },
      {
          "value": "peugeot",
          "label": "Peugeot"
      },
      {
          "value": "pgo",
          "label": "PGO"
      },
      {
          "value": "piaggio",
          "label": "Piaggio"
      },
      {
          "value": "polaris",
          "label": "Polaris"
      },
      {
          "value": "quadro",
          "label": "Quadro"
      },
      {
          "value": "real",
          "label": "Real"
      },
      {
          "value": "rewaco",
          "label": "Rewaco"
      },
      {
          "value": "rieju",
          "label": "Rieju"
      },
      {
          "value": "royal-enfield",
          "label": "Royal Enfield"
      },
      {
          "value": "scomadi",
          "label": "Scomadi"
      },
      {
          "value": "segway",
          "label": "Segway"
      },
      {
          "value": "sev",
          "label": "SEV"
      },
      {
          "value": "sherco",
          "label": "Sherco"
      },
      {
          "value": "silence",
          "label": "Silence"
      },
      {
          "value": "simson",
          "label": "Simson"
      },
      {
          "value": "skyteam",
          "label": "Skyteam"
      },
      {
          "value": "smc",
          "label": "SMC"
      },
      {
          "value": "solo",
          "label": "Solo"
      },
      {
          "value": "standard",
          "label": "Standard"
      },
      {
          "value": "stark-future",
          "label": "Stark Future"
      },
      {
          "value": "suzuki",
          "label": "Suzuki"
      },
      {
          "value": "swm",
          "label": "SWM"
      },
      {
          "value": "sym",
          "label": "SYM"
      },
      {
          "value": "talaria",
          "label": "Talaria"
      },
      {
          "value": "tauris",
          "label": "Tauris"
      },
      {
          "value": "tgb",
          "label": "TGB"
      },
      {
          "value": "tomos",
          "label": "Tomos"
      },
      {
          "value": "torrot",
          "label": "Torrot"
      },
      {
          "value": "triton",
          "label": "Triton"
      },
      {
          "value": "triumph",
          "label": "Triumph"
      },
      {
          "value": "turbho",
          "label": "Turbho"
      },
      {
          "value": "ural",
          "label": "Ural"
      },
      {
          "value": "vectrix",
          "label": "Vectrix"
      },
      {
          "value": "vertigo",
          "label": "Vertigo"
      },
      {
          "value": "vespa",
          "label": "Vespa"
      },
      {
          "value": "vespino",
          "label": "Vespino"
      },
      {
          "value": "victory",
          "label": "Victory"
      },
      {
          "value": "voge",
          "label": "Voge"
      },
      {
          "value": "voxan",
          "label": "Voxan"
      },
      {
          "value": "wmi",
          "label": "WMI"
      },
      {
          "value": "wottan-motor",
          "label": "Wottan Motor"
      },
      {
          "value": "xingfu",
          "label": "Xingfu"
      },
      {
          "value": "yamaha",
          "label": "Yamaha"
      },
      {
          "value": "zero-motorcycles",
          "label": "Zero Motorcycles"
      },
      {
          "value": "zipp",
          "label": "Zipp"
      },
      {
          "value": "zongshen",
          "label": "Zongshen"
      },
      {
          "value": "zweirad-union",
          "label": "Zweirad Union"
      }
  ]
};
