import assert from "node:assert/strict";
import { build } from "esbuild";
import { generateKeyPair, exportJWK, SignJWT } from "jose";
import test from "node:test";

const teamDomain = "broad-voice-f670.cloudflareaccess.com";
const issuer = `https://${teamDomain}`;
const audience = "4337c569505d0367294fd5adbdc57d49cbe1c0faf4b62f4a27eb8de2ff943a19";
const apiHost = "api-dev.techagenz.com";
const developmentAdmin = "haider.ly5617@gmail.com";
const keyPair = await generateKeyPair("RS256", { modulusLength: 2048 });
const jwk = {
  ...(await exportJWK(keyPair.publicKey)),
  kid: "admin-proj-key",
  alg: "RS256",
  use: "sig",
};

globalThis.fetch = async (input) => {
  if (String(input) === `https://${teamDomain}/cdn-cgi/access/certs`) {
    return new Response(JSON.stringify({ keys: [jwk] }), { status: 200 });
  }
  return new Response(null, { status: 404 });
};

const { outputFiles } = await build({
  entryPoints: ["src/index.ts"],
  bundle: true,
  format: "esm",
  platform: "browser",
  write: false,
});
const { default: worker } = await import(
  `data:text/javascript;base64,${Buffer.from(outputFiles[0].text).toString("base64")}`
);

async function tokenFor(email = developmentAdmin) {
  const now = Math.floor(Date.now() / 1000);
  return new SignJWT({
    iss: issuer,
    aud: audience,
    sub: `sub-${email}`,
    email,
    iat: now,
    exp: now + 300,
  })
    .setProtectedHeader({ alg: "RS256", kid: "admin-proj-key" })
    .sign(keyPair.privateKey);
}

function createMockDb() {
  const projects = new Map();
  const tags = [];
  const painPoints = [];
  const deliverables = [];
  const stack = [];
  const flowSteps = [];
  const stats = [];
  const bullets = [];
  const keyFeatures = [];

  function makeStatement(sql, args = []) {
    return {
      sql,
      args,
      bind(...newArgs) {
        return makeStatement(sql, newArgs);
      },
      async first() {
        if (sql.includes("FROM case_studies WHERE slug = ?")) {
          const slug = args[0];
          return projects.get(slug) || null;
        }
        return null;
      },
      async all() {
        if (sql.includes("SELECT * FROM case_studies")) {
          return { results: Array.from(projects.values()) };
        }
        const slug = args[0];
        if (sql.includes("FROM case_study_tags WHERE slug = ?")) {
          return {
            results: tags.filter((t) => t.slug === slug).map((t) => ({ id: 1, value: t.tag })),
          };
        }
        if (sql.includes("FROM case_study_pain_points WHERE slug = ?")) {
          return {
            results: painPoints
              .filter((p) => p.slug === slug)
              .map((p) => ({ id: 1, value: p.point })),
          };
        }
        if (sql.includes("FROM case_study_deliverables WHERE slug = ?")) {
          return {
            results: deliverables
              .filter((d) => d.slug === slug)
              .map((d) => ({ id: 1, value: d.deliverable })),
          };
        }
        if (sql.includes("FROM case_study_stack WHERE slug = ?")) {
          return {
            results: stack.filter((s) => s.slug === slug).map((s) => ({ id: 1, value: s.tech })),
          };
        }
        if (sql.includes("FROM case_study_flow_steps WHERE slug = ?")) {
          return {
            results: flowSteps
              .filter((f) => f.slug === slug)
              .map((f) => ({
                id: 1,
                step_code: f.step_code,
                title: f.title,
                description: f.description,
              })),
          };
        }
        if (sql.includes("FROM case_study_stats WHERE slug = ?")) {
          return {
            results: stats
              .filter((s) => s.slug === slug)
              .map((s) => ({ id: 1, label: s.label, value: s.value, context: s.context })),
          };
        }
        if (sql.includes("FROM case_study_result_bullets WHERE slug = ?")) {
          return {
            results: bullets
              .filter((b) => b.slug === slug)
              .map((b) => ({ id: 1, value: b.bullet })),
          };
        }
        if (sql.includes("FROM case_study_key_features WHERE slug = ?")) {
          return {
            results: keyFeatures
              .filter((k) => k.slug === slug)
              .map((k) => ({ id: 1, title: k.title, description: k.description, tag: k.tag })),
          };
        }
        return { results: [] };
      },
      async run() {
        if (sql.includes("INSERT INTO case_studies")) {
          const [
            slug,
            title,
            short_title,
            formula_summary,
            client_type,
            client_name,
            category,
            cover_image,
            featured_on_home,
            sort_order,
            timeline,
            status,
            problem_heading,
            problem_description,
            solution_heading,
            solution_description,
            architecture_overview,
            testimonial_quote,
            testimonial_author,
            testimonial_role,
            testimonial_company,
          ] = args;
          projects.set(slug, {
            slug,
            title,
            short_title,
            formula_summary,
            client_type,
            client_name,
            category,
            cover_image,
            featured_on_home,
            sort_order,
            timeline,
            status,
            problem_heading,
            problem_description,
            solution_heading,
            solution_description,
            architecture_overview,
            testimonial_quote,
            testimonial_author,
            testimonial_role,
            testimonial_company,
          });
        } else if (sql.includes("INSERT INTO case_study_tags")) {
          const [slug, tag, sort_order] = args;
          tags.push({ slug, tag, sort_order });
        } else if (sql.includes("INSERT INTO case_study_pain_points")) {
          const [slug, point, sort_order] = args;
          painPoints.push({ slug, point, sort_order });
        } else if (sql.includes("INSERT INTO case_study_deliverables")) {
          const [slug, deliverable, sort_order] = args;
          deliverables.push({ slug, deliverable, sort_order });
        } else if (sql.includes("INSERT INTO case_study_stack")) {
          const [slug, tech, sort_order] = args;
          stack.push({ slug, tech, sort_order });
        } else if (sql.includes("INSERT INTO case_study_flow_steps")) {
          const [slug, step, step_code, title, description, sort_order] = args;
          flowSteps.push({ slug, step, step_code, title, description, sort_order });
        } else if (sql.includes("INSERT INTO case_study_stats")) {
          const [slug, label, value, context, sort_order] = args;
          stats.push({ slug, label, value, context, sort_order });
        } else if (sql.includes("INSERT INTO case_study_result_bullets")) {
          const [slug, bullet, sort_order] = args;
          bullets.push({ slug, bullet, sort_order });
        } else if (sql.includes("INSERT INTO case_study_key_features")) {
          const [slug, title, description, tag, sort_order] = args;
          keyFeatures.push({ slug, title, description, tag, sort_order });
        } else if (sql.includes("UPDATE case_studies")) {
          const [
            title,
            short_title,
            formula_summary,
            client_type,
            client_name,
            category,
            cover_image,
            featured_on_home,
            sort_order,
            timeline,
            status,
            problem_heading,
            problem_description,
            solution_heading,
            solution_description,
            architecture_overview,
            testimonial_quote,
            testimonial_author,
            testimonial_role,
            testimonial_company,
            slug,
          ] = args;
          projects.set(slug, {
            slug,
            title,
            short_title,
            formula_summary,
            client_type,
            client_name,
            category,
            cover_image,
            featured_on_home,
            sort_order,
            timeline,
            status,
            problem_heading,
            problem_description,
            solution_heading,
            solution_description,
            architecture_overview,
            testimonial_quote,
            testimonial_author,
            testimonial_role,
            testimonial_company,
          });
        } else if (sql.includes("DELETE FROM case_study_tags WHERE slug = ?")) {
          const slug = args[0];
          const keep = tags.filter((t) => t.slug !== slug);
          tags.length = 0;
          tags.push(...keep);
        } else if (sql.includes("DELETE FROM case_study_pain_points WHERE slug = ?")) {
          const slug = args[0];
          const keep = painPoints.filter((p) => p.slug !== slug);
          painPoints.length = 0;
          painPoints.push(...keep);
        } else if (sql.includes("DELETE FROM case_study_deliverables WHERE slug = ?")) {
          const slug = args[0];
          const keep = deliverables.filter((d) => d.slug !== slug);
          deliverables.length = 0;
          deliverables.push(...keep);
        } else if (sql.includes("DELETE FROM case_study_stack WHERE slug = ?")) {
          const slug = args[0];
          const keep = stack.filter((s) => s.slug !== slug);
          stack.length = 0;
          stack.push(...keep);
        } else if (sql.includes("DELETE FROM case_study_flow_steps WHERE slug = ?")) {
          const slug = args[0];
          const keep = flowSteps.filter((f) => f.slug !== slug);
          flowSteps.length = 0;
          flowSteps.push(...keep);
        } else if (sql.includes("DELETE FROM case_study_stats WHERE slug = ?")) {
          const slug = args[0];
          const keep = stats.filter((s) => s.slug !== slug);
          stats.length = 0;
          stats.push(...keep);
        } else if (sql.includes("DELETE FROM case_study_result_bullets WHERE slug = ?")) {
          const slug = args[0];
          const keep = bullets.filter((b) => b.slug !== slug);
          bullets.length = 0;
          bullets.push(...keep);
        } else if (sql.includes("DELETE FROM case_study_key_features WHERE slug = ?")) {
          const slug = args[0];
          const keep = keyFeatures.filter((k) => k.slug !== slug);
          keyFeatures.length = 0;
          keyFeatures.push(...keep);
        } else if (sql.includes("DELETE FROM case_studies WHERE slug = ?")) {
          const slug = args[0];
          projects.delete(slug);
        }
        return { success: true };
      },
    };
  }

  return {
    prepare(sql) {
      return makeStatement(sql);
    },
    async batch(stmts) {
      for (const stmt of stmts) {
        await stmt.run();
      }
      return [];
    },
    getState() {
      return {
        projects,
        tags,
        painPoints,
        deliverables,
        stack,
        flowSteps,
        stats,
        bullets,
        keyFeatures,
      };
    },
  };
}

function makeEnv(db) {
  return {
    CF_ACCESS_TEAM_DOMAIN: teamDomain,
    CF_ACCESS_AUD: audience,
    CF_ACCESS_API_HOST: apiHost,
    ADMIN_ALLOWED_EMAILS: developmentAdmin,
    ADMIN_CMS_ENABLED: "true",
    DB: db,
    ASSETS: {
      async get() {
        return null;
      },
      async put() {},
      async delete() {},
    },
    ENQUIRY_RATE_LIMITER: {
      async limit() {
        return { success: true };
      },
    },
    ENVIRONMENT: "development",
    RESEND_API_KEY: "",
    CF_TURNSTILE_SECRET_KEY: "",
  };
}

test("Admin Project CRUD: create with all 8 child tables, get, update, delete", async () => {
  const db = createMockDb();
  const runtimeEnv = makeEnv(db);
  const token = await tokenFor();

  // 1. Create Project
  const createRes = await worker.fetch(
    new Request(`https://${apiHost}/api/admin/projects`, {
      method: "POST",
      headers: {
        "Cf-Access-Jwt-Assertion": token,
        Origin: "https://admin-dev.techagenz.com",
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        title: "Fintech Automated Audit Portal",
        shortTitle: "Fintech Audit",
        category: "Financial Technology",
        clientName: "Apex Capital",
        coverImage: "/work-images/apex.webp",
        tags: ["React", "D1", "Workers"],
        problem: {
          heading: "Manual Compliance Audits",
          description: "Audits took weeks of manual labor.",
          painPoints: ["Slow verification", "Data silos"],
        },
        solution: {
          heading: "Automated Real-Time Ingestion",
          description: "Built a real-time compliance ledger.",
          keyDeliverables: ["Audit Dashboard", "D1 Schema"],
        },
        stack: ["TypeScript", "Cloudflare Workers", "D1"],
        architecture: {
          overview: "Global Edge Network with SQLite replication.",
          flowSteps: [
            { step: "01", title: "Data Ingestion", description: "Real-time transaction capture." },
          ],
        },
        results: {
          stats: [{ metric: "95%", label: "Efficiency Gain", context: "Audit completion speed" }],
          bullets: ["Zero data loss", "Instant reports"],
        },
        keyFeatures: [
          { title: "Row-Level Auditing", description: "Every modification tracked.", tag: "Core" },
        ],
        testimonial: {
          quote: "Transformed our regulatory reporting.",
          author: "Jane Doe",
          role: "CTO",
          organization: "Apex Capital",
        },
      }),
    }),
    runtimeEnv,
    {},
  );

  assert.equal(createRes.status, 201);
  const created = (await createRes.json()).data;
  assert.equal(created.slug, "fintech-automated-audit-portal");
  assert.equal(created.title, "Fintech Automated Audit Portal");
  assert.deepEqual(created.tags, ["React", "D1", "Workers"]);
  assert.deepEqual(created.problem.painPoints, ["Slow verification", "Data silos"]);
  assert.deepEqual(created.solution.keyDeliverables, ["Audit Dashboard", "D1 Schema"]);
  assert.deepEqual(created.stack, ["TypeScript", "Cloudflare Workers", "D1"]);
  assert.equal(created.architecture.flowSteps.length, 1);
  assert.equal(created.results.stats.length, 1);
  assert.equal(created.results.bullets.length, 2);
  assert.equal(created.keyFeatures.length, 1);
  assert.equal(created.testimonial.author, "Jane Doe");

  const state = db.getState();
  assert.equal(state.projects.size, 1);
  assert.equal(state.tags.length, 3);
  assert.equal(state.painPoints.length, 2);
  assert.equal(state.deliverables.length, 2);
  assert.equal(state.stack.length, 3);
  assert.equal(state.flowSteps.length, 1);
  assert.equal(state.stats.length, 1);
  assert.equal(state.bullets.length, 2);
  assert.equal(state.keyFeatures.length, 1);

  // 2. Get Project
  const getRes = await worker.fetch(
    new Request(`https://${apiHost}/api/admin/projects/fintech-automated-audit-portal`, {
      method: "GET",
      headers: { "Cf-Access-Jwt-Assertion": token, Origin: "https://admin-dev.techagenz.com" },
    }),
    runtimeEnv,
    {},
  );
  assert.equal(getRes.status, 200);
  const fetched = (await getRes.json()).data;
  assert.equal(fetched.clientName, "Apex Capital");

  // 3. Update Project
  const updateRes = await worker.fetch(
    new Request(`https://${apiHost}/api/admin/projects/fintech-automated-audit-portal`, {
      method: "PUT",
      headers: {
        "Cf-Access-Jwt-Assertion": token,
        Origin: "https://admin-dev.techagenz.com",
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        title: "Fintech Automated Audit Portal v2",
        tags: ["React", "Workers"],
      }),
    }),
    runtimeEnv,
    {},
  );
  assert.equal(updateRes.status, 200);
  const updated = (await updateRes.json()).data;
  assert.equal(updated.title, "Fintech Automated Audit Portal v2");
  assert.deepEqual(updated.tags, ["React", "Workers"]);

  // 4. Delete Project
  const delRes = await worker.fetch(
    new Request(`https://${apiHost}/api/admin/projects/fintech-automated-audit-portal`, {
      method: "DELETE",
      headers: { "Cf-Access-Jwt-Assertion": token, Origin: "https://admin-dev.techagenz.com" },
    }),
    runtimeEnv,
    {},
  );
  assert.equal(delRes.status, 200);
  assert.equal(state.projects.size, 0);
  assert.equal(state.tags.length, 0);
});
