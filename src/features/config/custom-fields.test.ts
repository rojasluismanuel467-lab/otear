import assert from "node:assert/strict";
import test from "node:test";
import {
  MAX_FIELDS_PER_TARGET,
  applyPresetFields,
  createField,
  displayValue,
  editField,
  editOptions,
  fieldsFor,
  missingRequired,
  parseInput,
  removeOrArchive,
  restoreField,
  sanitizeFields,
  usageCount,
  usedOptions,
  type CustomField,
} from "./custom-fields.ts";
import {
  CANA_AGE_FIELD,
  CANA_CUT_FIELD,
  canaExampleValues,
  canaFields,
} from "./preset-fields.ts";

const make = (
  fields: CustomField[],
  input: Parameters<typeof createField>[1],
) => {
  const result = createField(fields, input);
  assert.ok(result.ok, result.ok ? "" : result.error);
  return result.ok ? result.value : (undefined as never);
};

test("a field needs a title and a list needs two options", () => {
  assert.equal(
    createField([], { target: "flight", type: "text", title: "  " }).ok,
    false,
  );
  assert.equal(
    createField([], {
      target: "flight",
      type: "list",
      title: "Zona",
      options: ["Norte"],
    }).ok,
    false,
  );
  const list = make([], {
    target: "flight",
    type: "list",
    title: "Zona",
    options: ["Norte", "Sur", "Norte"],
  });
  assert.equal(list.options?.length, 2);
});

test("titles are unique per object and fields are capped", () => {
  const first = make([], {
    target: "flight",
    type: "text",
    title: "Orden de trabajo",
  });
  assert.equal(
    createField([first], {
      target: "flight",
      type: "number",
      title: "orden de trabajo",
    }).ok,
    false,
  );
  assert.ok(
    createField([first], {
      target: "finding",
      type: "number",
      title: "Orden de trabajo",
    }).ok,
  );
  let fields: CustomField[] = [];
  for (let i = 0; i < MAX_FIELDS_PER_TARGET; i += 1)
    fields = [
      ...fields,
      make(fields, { target: "invoice", type: "text", title: `Campo ${i}` }),
    ];
  const capped = createField(fields, {
    target: "invoice",
    type: "text",
    title: "Uno más",
  });
  assert.equal(capped.ok, false);
});

test("after creation only the title, description, unit and required flag can change", () => {
  const field = make([], {
    target: "aircraft",
    type: "number",
    title: "Peso",
    unit: "kg",
  });
  const result = editField([field], field.id, {
    title: "Peso al despegue",
    unit: "g",
    required: true,
  });
  assert.ok(result.ok);
  if (result.ok) {
    assert.equal(result.value[0].title, "Peso al despegue");
    assert.equal(result.value[0].type, "number");
    assert.equal(result.value[0].unit, "g");
    assert.equal(result.value[0].required, true);
  }
  assert.equal(editField([field], field.id, { title: "" }).ok, false);
});

test("a field in use is archived, one that is not is deleted, and an archived one can come back", () => {
  const field = make([], { target: "finding", type: "text", title: "Causa" });
  assert.equal(removeOrArchive([field], field.id, 0).outcome, "deleted");
  const archived = removeOrArchive([field], field.id, 3);
  assert.equal(archived.outcome, "archived");
  assert.equal(fieldsFor(archived.fields, "finding").length, 0);
  assert.equal(fieldsFor(archived.fields, "finding", true).length, 1);
  const back = restoreField(archived.fields, field.id);
  assert.ok(back.ok);
  if (back.ok) assert.equal(fieldsFor(back.value, "finding").length, 1);
});

test("an option in use cannot be removed but can be renamed or added", () => {
  const field = make([], {
    target: "flight",
    type: "list",
    title: "Zona",
    options: ["Norte", "Sur"],
  });
  const [north, south] = field.options!;
  const used = new Set([north.id]);
  assert.equal(
    editOptions([field], field.id, [south, { id: "x", label: "Este" }], used)
      .ok,
    false,
  );
  const renamed = editOptions(
    [field],
    field.id,
    [{ ...north, label: "Zona norte" }, south, { id: "n3", label: "Este" }],
    used,
  );
  assert.ok(renamed.ok);
  if (renamed.ok) assert.equal(renamed.value[0].options?.length, 3);
});

test("usage counts records with a value and the options in use", () => {
  const field = make([], {
    target: "flight",
    type: "list",
    title: "Zona",
    options: ["Norte", "Sur"],
  });
  const records = [
    { customValues: { [field.id]: field.options![0].id } },
    { customValues: { [field.id]: "" } },
    {},
  ];
  assert.equal(usageCount(field, records), 1);
  assert.deepEqual([...usedOptions(field, records)], [field.options![0].id]);
});

test("typed input is read by type and bad input is refused", () => {
  const number = make([], {
    target: "invoice",
    type: "number",
    title: "Horas",
    unit: "h",
  });
  const date = make([], { target: "invoice", type: "date", title: "Entrega" });
  const list = make([], {
    target: "invoice",
    type: "list",
    title: "Centro",
    options: ["A", "B"],
  });
  assert.deepEqual(parseInput(number, "12,5"), { ok: true, value: 12.5 });
  assert.equal(parseInput(number, "abc").ok, false);
  assert.deepEqual(parseInput(number, " "), { ok: true, value: null });
  assert.equal(parseInput(date, "2026-13-40").ok, false);
  assert.deepEqual(parseInput(date, "2026-10-28"), {
    ok: true,
    value: "2026-10-28",
  });
  assert.equal(parseInput(list, "otra").ok, false);
  assert.ok(parseInput(list, list.options![0].id).ok);
});

test("text input is kept and only cut when it passes the limit", () => {
  const short = make([], { target: "flight", type: "text", title: "OT" });
  const long = make([short], {
    target: "flight",
    type: "paragraph",
    title: "Notas",
  });
  assert.deepEqual(parseInput(short, " OT-1042 "), {
    ok: true,
    value: "OT-1042",
  });
  const cut = parseInput(short, "x".repeat(300));
  assert.ok(
    cut.ok && typeof cut.value === "string" && cut.value.length === 200,
  );
  const big = parseInput(long, "y".repeat(2500));
  assert.ok(
    big.ok && typeof big.value === "string" && big.value.length === 2000,
  );
});

test("values are shown with their label or unit and retired options say so", () => {
  const number = make([], {
    target: "invoice",
    type: "number",
    title: "Horas",
    unit: "h",
  });
  assert.equal(displayValue(number, 12.5), "12,5 h");
  const list = make([], {
    target: "invoice",
    type: "list",
    title: "Centro",
    options: ["A", "B"],
  });
  assert.equal(displayValue(list, list.options![1].id), "B");
  assert.equal(displayValue(list, "gone"), "Opción retirada");
  assert.equal(displayValue(list, undefined), "");
});

test("required fields without a value are reported", () => {
  const a = make([], {
    target: "flight",
    type: "text",
    title: "OT",
    required: true,
  });
  const b = make([a], { target: "flight", type: "text", title: "Nota" });
  assert.deepEqual(
    missingRequired([a, b], { [b.id]: "x" }).map((f) => f.title),
    ["OT"],
  );
  assert.equal(missingRequired([a, b], { [a.id]: "1" }).length, 0);
});

test("an imported list of fields is cleaned", () => {
  const cleaned = sanitizeFields([
    { id: "f1", target: "flight", type: "text", title: "OT" },
    { id: "f1", target: "flight", type: "text", title: "Duplicado" },
    { id: "f2", target: "nope", type: "text", title: "X" },
    { id: "f3", target: "flight", type: "list", title: "Sin opciones" },
    {
      id: "f4",
      target: "flight",
      type: "list",
      title: "Zona",
      options: [
        { id: "a", label: "N" },
        { id: "b", label: "S" },
      ],
    },
    "basura",
  ]);
  assert.deepEqual(
    cleaned.map((f) => f.id),
    ["f1", "f4"],
  );
  assert.equal(sanitizeFields("nada").length, 0);
});

test("a preset brings its fields once, archives them when another preset replaces it and keeps the company's own", () => {
  const own = make([], { target: "flight", type: "text", title: "OT" });
  const withCana = applyPresetFields([own], canaFields);
  assert.deepEqual(
    fieldsFor(withCana, "flight").map((f) => f.id),
    [own.id, CANA_AGE_FIELD, CANA_CUT_FIELD],
  );
  // Applying it again adds nothing.
  assert.equal(applyPresetFields(withCana, canaFields).length, withCana.length);
  // Another preset hides the cane fields but keeps them (and their stored values) for later.
  const without = applyPresetFields(withCana, []);
  assert.deepEqual(
    fieldsFor(without, "flight").map((f) => f.id),
    [own.id],
  );
  assert.equal(without.length, withCana.length);
  const back = applyPresetFields(without, canaFields);
  assert.equal(fieldsFor(back, "flight").length, 3);
});

test("a preset field is skipped when the title is taken or the record kind is full", () => {
  const taken = make([], {
    target: "flight",
    type: "text",
    title: "Estado de corte",
  });
  assert.deepEqual(
    fieldsFor(applyPresetFields([taken], canaFields), "flight").map(
      (f) => f.id,
    ),
    [taken.id, CANA_AGE_FIELD],
  );
  let full: CustomField[] = [];
  for (let i = 0; i < MAX_FIELDS_PER_TARGET; i += 1)
    full = [
      ...full,
      make(full, { target: "flight", type: "text", title: `Campo ${i}` }),
    ];
  assert.equal(applyPresetFields(full, canaFields).length, full.length);
});

test("the example values of the cane fields match the field's options and grow with the date", () => {
  const options = new Set(canaFields[1].options?.map((o) => o.id));
  const early = canaExampleValues("2026-07-18");
  const late = canaExampleValues("2026-10-29");
  assert.ok(options.has(String(early[CANA_CUT_FIELD])));
  assert.ok(options.has(String(late[CANA_CUT_FIELD])));
  assert.ok(late[CANA_AGE_FIELD] > early[CANA_AGE_FIELD]);
});
