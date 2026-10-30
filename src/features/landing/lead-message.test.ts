import assert from "node:assert/strict";
import { describe, it } from "node:test";
import {
  leadText,
  mailtoHref,
  whatsappHref,
  type Lead,
} from "./lead-message.ts";

const lead: Lead = {
  name: "Hernando Álvarez",
  email: "hernando@santarita.co",
  sector: "agricultura",
  company: "",
  role: "",
  whatsapp: "",
  message: "",
};

describe("leadText", () => {
  it("writes a short message from the first step alone", () => {
    assert.equal(
      leadText(lead),
      [
        "Hola, soy Hernando Álvarez.",
        "Opero en agricultura.",
        "Vi Otear y quisiera conversar.",
        "",
        "Correo: hernando@santarita.co",
      ].join("\n"),
    );
  });

  it("adds the optional details only when they were filled in", () => {
    const text = leadText({
      ...lead,
      company: "Hacienda Santa Rita",
      role: "Gerente / dueño",
      whatsapp: "+57 300 000 0000",
      message: "Quiero comparar el avance de mis lotes.",
    });
    assert.match(text, /trabajo en Hacienda Santa Rita/);
    assert.match(text, /mi cargo es gerente \/ dueño/);
    assert.match(text, /Quiero comparar el avance de mis lotes\./);
    assert.match(text, /WhatsApp: \+57 300 000 0000/);
  });

  it("keeps single-line fields on one line", () => {
    const text = leadText({ ...lead, name: "Ana\nPérez  Gómez" });
    assert.ok(text.startsWith("Hola, soy Ana Pérez Gómez."));
  });
});

describe("whatsappHref", () => {
  it("keeps only the digits of the number and encodes the text", () => {
    const href = whatsappHref("+57 300 123-4567", lead);
    assert.ok(href?.startsWith("https://wa.me/573001234567?text="));
    assert.ok(href?.includes(encodeURIComponent("Hola, soy Hernando")));
  });

  it("is null when no number is configured", () => {
    assert.equal(whatsappHref(undefined, lead), null);
    assert.equal(whatsappHref("  ", lead), null);
  });
});

describe("mailtoHref", () => {
  it("builds a subject and a body", () => {
    const href = mailtoHref("hola@otear.app", lead);
    assert.ok(href?.startsWith("mailto:hola@otear.app?subject="));
    assert.ok(href?.includes("&body="));
    assert.ok(href?.includes(encodeURIComponent("Interés en Otear")));
  });

  it("names the company in the subject when given", () => {
    const href = mailtoHref("hola@otear.app", {
      ...lead,
      company: "Santa Rita",
    });
    assert.ok(
      href?.includes(encodeURIComponent("Interés en Otear — Santa Rita")),
    );
  });

  it("cannot be bent into extra headers through the typed text", () => {
    const href = mailtoHref("hola@otear.app", {
      ...lead,
      name: "Ana&bcc=otro@x.co",
      company: "X\r\nBcc: otro@x.co",
    });
    assert.ok(href);
    assert.equal((href.match(/[?&]subject=/g) ?? []).length, 1);
    assert.ok(!/[\r\n]/.test(href));
    assert.ok(!href.includes("&bcc="));
  });

  it("is null for a missing or malformed address", () => {
    assert.equal(mailtoHref(undefined, lead), null);
    assert.equal(mailtoHref("no-es-correo", lead), null);
    assert.equal(mailtoHref("a@b.co?cc=x@y.co", lead), null);
  });
});
