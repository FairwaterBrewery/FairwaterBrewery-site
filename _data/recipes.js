// _data/recipes.js
import fs from "fs/promises";
import xml2js from "xml2js";

// Rounding helpers
const round1 = (v) => v == null ? null : Math.round(v * 10) / 10;        // 1 decimal place
const round2 = (v) => v == null ? null : Math.round(v * 100) / 100;      // 2 decimal places
const round0 = (v) => v == null ? null : Math.round(v);                  // nearest integer

// include the builder functions above here

export default async function() {
  const files = await fs.readdir('./public/beerxml');
  const xmlFiles = files.filter((file) => file.endsWith('.xml'));

  const output = await Promise.all(
    xmlFiles.map(async (file) => {
      const content = await fs.readFile(`./public/beerxml/${file}`, 'utf8');
      const parser = new xml2js.Parser({ normalizeTags: true });
      const model = await parser.parseStringPromise(content);

      const recipe = model.recipes.recipe[0];
      const brewday = buildBrewday(recipe);
      const sections = buildCollapsibleSections(brewday);

      return {
        file: file.split('.').slice(0, -1).join('.'),
        model,
        brewday,
        sections
      };
    })
  );

  return output.sort((a, b) => {
    const nameA = a.model.recipes.recipe[0].name;
    const nameB = b.model.recipes.recipe[0].name;
    return nameA < nameB ? -1 : nameA > nameB ? 1 : 0;
  });
};


// --- Utility: always return an array ---
const arr = (x) => Array.isArray(x) ? x : [];

// --- Build structured brewday JSON ---
function buildBrewday(recipe) {

  //
  // MASH LIQUOR
  //
  const mashArr = arr(recipe.mash);
  const mashStepsArr = mashArr.length ? arr(mashArr[0].mash_steps) : [];
  const mashSteps = mashStepsArr.length ? arr(mashStepsArr[0].mash_step) : [];

  const miscs = recipe.miscs ? arr(recipe.miscs[0].misc) : [];
  const mashChemicals = miscs.filter(m => m.use?.[0] === "Mash");

  const mashLiquor = {
    waterAmountLitres: mashSteps.length
      ? round2(parseFloat(mashSteps[0].display_infuse_amt?.[0]))
      : null,
    strikeTempC: mashSteps.length
      ? round1(parseFloat(mashSteps[0].infuse_temp?.[0]))
      : null,
    chemicals: mashChemicals.map(m => ({
      name: m.name?.[0],
      amount: m.display_amount?.[0]   // already formatted
    }))
  };

  mashLiquor.chemicals = mashChemicals.map(m => ({
    name: m.name?.[0],
    amount: m.display_amount?.[0]
  }));


  //
  // GRAIN BILL
  //
  const fermentables = recipe.fermentables ? arr(recipe.fermentables[0].fermentable) : [];
  const grainBill = fermentables.map(f => ({
    name: f.name?.[0],
    amountKg: round2(parseFloat(f.amount?.[0]))
  }));



  //
  // SPARGE LIQUOR (calculated)
  //
  const totalWaterArr = recipe.waters ? arr(recipe.waters[0].water) : [];
  const totalWaterLitres = totalWaterArr.length
    ? round2(parseFloat(totalWaterArr[0].amount?.[0]))
    : null;

  const mashWaterLitres = mashSteps.length
    ? round2(parseFloat(mashSteps[0].display_infuse_amt?.[0]))
    : null;

  const spargeWaterLitres =
    totalWaterLitres != null && mashWaterLitres != null
      ? round2(totalWaterLitres - mashWaterLitres)
      : null;

  const spargeChemicals = miscs.filter(m => m.use?.[0] === "Sparge");

  const spargeLiquor = {
    waterAmountLitres: spargeWaterLitres,
    chemicals: spargeChemicals.map(m => ({
      name: m.name?.[0],
      amount: m.display_amount?.[0]
    }))
  };



  //
  // BOIL ADDITIONS
  //
  const hopsArr = recipe.hops ? arr(recipe.hops[0].hop) : [];
  const boilHops = hopsArr.filter(h => h.use?.[0] === "Boil");

  const boilMiscs = miscs.filter(m => m.use?.[0] === "Boil");

  const boil = {
  timeMinutes: parseFloat(recipe.boil_time?.[0]) || 60,
  additions: [
    ...boilHops.map(h => ({
      name: h.name?.[0],
      amountG: round2(h.amount?.[0] * 1000),   // grams, 2 decimals
      unit: "g",
      time: round0(parseFloat(h.time?.[0]) || 0),
      type: "Hop"
    })),
    ...boilMiscs.map(m => ({
      name: m.name?.[0],
      amount: m.display_amount?.[0],           // already formatted
      unit: null,
      time: round0(parseFloat(m.time?.[0]) || 0),
      type: m.type?.[0]
    }))
  ]
};


  //
  // WHIRLPOOL
  //
  const whirlpoolHops = hopsArr.filter(h => h.use?.[0] === "Aroma");
  const whirlpoolMiscs = miscs.filter(m => m.use?.[0] === "Whirlpool");

  const whirlpool = {

    additions: [
      // Whirlpool hops
      ...whirlpoolHops.map(h => ({
        name: h.name?.[0],
        amount: `${round2(h.amount?.[0] * 1000)} g`,
        time: round0(parseFloat(h.time?.[0]) || 0),
        type: "Hop"
      })),

      // Whirlpool misc additions
      ...whirlpoolMiscs.map(m => ({
        name: m.name?.[0],
        amount: m.display_amount?.[0],
        time: round0(parseFloat(m.time?.[0]) || 0),
        type: m.type?.[0]
      }))
    ]
  };

  //
  // PRIMARY FERMENTATION
  //
  const yeastArr = recipe.yeasts ? arr(recipe.yeasts[0].yeast) : [];
  const yeast = yeastArr.length ? yeastArr[0] : null;

  // Primary misc additions (e.g., NBS Clarity, ALDC)
  const primaryMiscs = miscs.filter(m => m.use?.[0] === "Primary");

  const primaryFermentation = {
    yeast: yeast
      ? {
          name: yeast.name?.[0],
          amount: round0(yeast.amount?.[0]),
          lab: yeast.laboratory?.[0],
          productId: yeast.product_id?.[0]
        }
      : null,

    temperatureC: round1(parseFloat(recipe.primary_temp?.[0])),

    dryHop: hopsArr
      .filter(h => h.use?.[0] === "Dry Hop")
      .map(h => ({
        name: h.name?.[0],
        amount: `${round2(h.amount?.[0] * 1000)} g`
      })),

    miscs: primaryMiscs.map(m => ({
      name: m.name?.[0],
      amount: m.display_amount?.[0]
    }))
  };


  return {
    mashLiquor,
    grainBill,
    spargeLiquor,
    boil,
    whirlpool,
    primaryFermentation
  };
}


// --- Build collapsible UI sections ---
function buildCollapsibleSections(brewday) {
  const yeast = brewday.primaryFermentation.yeast;

  return [
    {
      id: "mash-liquor",
      title: "Mash Liquor",
      items: [
        `Heat ${brewday.mashLiquor.waterAmountLitres ?? "?"} L to ${brewday.mashLiquor.strikeTempC ?? "?"}°C`,
        ...brewday.mashLiquor.chemicals.map(c => `Add ${c.name} – ${c.amount}`)
      ]
    },

    {
      id: "grain-bill",
      title: "Grain Bill",
      items: brewday.grainBill.map(g => `${g.name} – ${g.amountKg} kg`)
    },

    {
      id: "sparge-liquor",
      title: "Sparge Liquor",
      items: [
        `Heat ${brewday.spargeLiquor.waterAmountLitres} L sparge water`,
        ...brewday.spargeLiquor.chemicals.map(c => `Add ${c.name} – ${c.amount}`)
      ]
    },

    {
      id: "boil",
      title: "Boil",
      items: [
        `Start ${brewday.boil.timeMinutes}-minute boil`,
        ...brewday.boil.additions.map(a =>
          a.type === "Hop"
            ? `At ${a.time} min: Add ${a.amountG} ${a.unit} ${a.name}`
            : `At ${a.time} min: Add ${a.amount} ${a.name}`
        )
      ]
    },

    {
      id: "whirlpool",
      title: "Whirlpool",
      items: [
        ...(brewday.whirlpool.additions.length
          ? brewday.whirlpool.additions.map(a =>
              `For ${a.time} min: Add ${a.amount} ${a.name}`
            )
          : ["No whirlpool"])
      ]
    },

    {
      id: "primary-fermentation",
      title: "Primary Fermentation",
      items: [
        yeast
          ? `Pitch yeast: ${yeast.amount} x ${yeast.name} (${yeast.lab})`
          : "Pitch yeast: (not specified in BeerXML)",

        `Ferment at ${brewday.primaryFermentation.temperatureC ?? "?"}°C`,

        ...(brewday.primaryFermentation.miscs.length
          ? brewday.primaryFermentation.miscs.map(m =>
              `Add ${m.amount} ${m.name}`
            )
          : []),

        ...(brewday.primaryFermentation.dryHop.length
          ? brewday.primaryFermentation.dryHop.map(d =>
              `Dry hop: ${d.amount} ${d.name}`
            )
          : ["Dry hop: none"])
      ]
    }

  ];
}
