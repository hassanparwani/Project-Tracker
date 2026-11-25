// Seed data: built from the 23-Nov meeting notes, Puja's PY2028 plan (v2) and the payer status slide.
const NS='Not started',IP='In progress',NA='Needs attention';
const R=(ws,t,a,r,c,s,d,dl,st,n)=>({ws,t,a,r,c,s,d,dl,st,n});
const PM='PMO',PY='Payer Contracts',MS='MSSP & C-SNP',LG='Legal',RC='Recruitment';
const rows=[
// PMO
R(PM,'Daily 30-min growth stand-up (separate from MSSP stand-up)','Hassan','Hassan','Puja, Najeeb, Amber','2026-11-30','2026-11-30','',NS,'Notes say "Monday" with no date. 30 Nov assumed.'),
R(PM,'Circulate revised integrated plan (this tool)','Hassan','Najeeb','Puja','2026-11-24','2026-11-30','',IP,'Due date assumed. Confirm.'),
R(PM,'Hassan + Puja review first draft; Anwar clarifies open items','Hassan','Puja','Anwar','2026-12-01','2026-12-04','',NS,'Due date assumed. Confirm.'),
R(PM,"Review Najeeb's pre-work on 2027 target practices/groups",'Hassan','Najeeb','Puja','2026-11-23','2026-11-30','',IP,'Open questions go into the recruitment plan.'),
R(PM,'Confirm removal of old C-SNP plan items 28 and 29 (covered by item 27)','Hassan','Hassan','Anwar','','','Date TBC',NS,'FLAG: confirm these two items are the ones the meeting removed.'),
R(PM,'Name long-term owner for recruitment and sales; decide Shinoj\'s role','Anwar','Puja','Hassan','','2026-11-30','End of Nov',NS,'Anwar and Puja own recruitment until then.'),
// Payer contracts: the 13 payers on the status slide
R(PY,'WellMed (UHC TX): close gaps and attestations; no 4.0 Star gate in 2027','Puja','Anwar','MK Consulting','2026-11-24','2026-12-31','',NA,'Star 2.46. MA 599. Next: roster 11/25; contract meeting week of 11/30; 96 to see.'),
R(PY,'BCBS Texas (HCSC): sign MA termination; ACO quality 21% vs 50% gateway','Anwar','Puja','MK Consulting','2026-11-24','2026-12-31','',NA,'MA 91, Comm 9,286. Confirm payout 12/1; MA ends 12/31.'),
R(PY,'Antidote: 99214 direct 120% (~$160) vs ACN 155% (~$207)','Anwar','Puja','','2026-11-25','2027-01-01','',NA,'Comm 22. Claims check 11/25. Notice due 1/1/2027.'),
R(PY,'Optum AZ: Star push for 2026 shared savings; 2027 terms','Puja','Dr. Abdou','Anwar','2026-11-24','2026-12-31','',IP,'Star 3.32 (HEDIS, Nov) vs >3.75 needed by 12/31. RISK: gap looks too big. 2027 terms Q1. MA 4,328.'),
R(PY,'Humana TX: direct deal, upside-only shared savings, C-SNP terms','Puja','Anwar','MK Consulting','2026-11-23','2027-01-31','Jan 2027',IP,'MA 1,837. Attribution fix sent 11/23 (681). January meeting requested. Star TBD.'),
R(PY,'Aetna: AZ ~74% to 100% of Medicare; TX no reply','Puja','Anwar','MK Consulting','2026-11-20','2026-12-04','Wk of 11/30',IP,'Counter sent 11/20; review week of 11/30. MA 1,726, Comm 3,831.'),
R(PY,'HealthSpring: cap 7% + $50 PMPM + 50/50','Anwar','Puja','','2026-11-24','2026-12-01','12/1',IP,'Working session TBD. P4Q report 12/1. MA 1,091. TX 1.72 star, AZ 2.5.'),
R(PY,'Cigna AZ: raise lowest commercial rate (~70% of Medicare)','MK Consulting','Anwar','Puja','2026-11-24','2026-11-30','By 11/30',IP,'Cigna analytics review by 11/30. Comm ~2,253.'),
R(PY,'BCBS of Arizona: group contract (~73% of Medicare); BH billing','MK Consulting','Anwar','Puja','2027-05-01','2027-08-31','May-Aug 2027',IP,'MA via Optum. Timeline May-Aug 2027.'),
R(PY,'Humana AZ: go direct at Model Practice rates (2x ACN)','Anwar','Puja','MK Consulting','2027-01-01','2027-03-31','Q1 2027',NS,'Ask by Q1 2027. MA 2,147.'),
R(PY,'UnitedHealthcare AZ: terms and incentive (P4P)','Anwar','Puja','','2026-11-25','2027-07-03','Notice ~7/3/27',NS,'Terms 11/25. Same as Optum for MA. MA 1,546.'),
R(PY,'ACN: stay vs go direct; dual-contracting review','Anwar, Puja','Maria, Kellie','Hassan','2026-11-25','2027-09-02','Notice ~9/2/27',NS,'Owner "to be assigned" on slide; Anwar + Puja placed as default. Legal review 11/25. Comm 9,422.'),
R(PY,'SCAN, Alignment, eternal: lower membership gates (500/750)','Anwar','Puja','','2027-06-30','2027-07-01','Notices 6/30-7/1',NS,'MA 186. Owner "TBA" on slide.'),
R(PY,'Move payer negotiations into Q1; restate status of each payer','Puja','Hassan','Anwar','2026-11-24','2026-11-30','',IP,'Major payers have not responded.'),
R(PY,'Project Fidelity: check payer payments match contract terms (parallel, not a prerequisite)','Hassan','Puja','Amber','','','Date TBC',NS,'Immediate priority.'),
R(PY,'Payer-by-payer plan for moving into risk (how and when)','Puja','Anwar, Hassan','MK Consulting, Dr. Abdou','2027-01-01','2027-03-31','Q1 2027',NS,'Deal structures differ by payer. Seasonal arrangements separate.'),
R(PY,'2027-2028 payer strategy: value-based and MA risk; current contract terms','Puja','Anwar','Hassan','','2027-03-31','Q1 2027',NS,''),
// MSSP & C-SNP
R(MS,'PY2028 MSSP: recruitment and additions continue through July','Puja','Hassan, Najeeb','Florence','2027-01-01','2027-07-31','',NS,'Confirm exact rules with Florence.'),
R(MS,'PY2028 MSSP: participants can be removed (August)','Puja','Hassan','Florence','2027-08-01','2027-08-31','',NS,''),
R(MS,'PY2028 MSSP: final participant list set (September)','Puja','Hassan','Florence','2027-09-01','2027-09-30','',NS,''),
R(MS,'Get participant-list requirements from Florence; finalise milestones','Hassan','Puja','Florence','','','Date TBC',NS,'Anwar to explain the participant-window requirements.'),
R(MS,'Verify C-SNP service-area information and requirements (independent check)','Hassan','Hassan','','','','Date TBC',NS,'No extra executive review needed.'),
R(MS,'C-SNP / MSO framework and MA risk strategy (plan item 27)','Anwar','Puja','MK Consulting','2027-01-01','2027-03-31','Q1 2027',NS,''),
R(MS,'MSSP target: 15,000 new attributed lives for PY2028','Puja','Najeeb','Hassan','2026-11-24','2027-07-31','',IP,'Plan target 15K. Puja\'s plan: 22K base, 30K stretch. $14.5K benchmark floor.'),
// Legal
R(LG,'Review contracts with WellMed, SWHR, Methodist and others before recruiting','Maria','Kellie, Puja','Hassan, Harrison','2026-11-24','2026-12-10','',IP,'Set the Dec 10 legal checkpoint. Define obligations, posture and whether dialogue with them is needed.'),
R(LG,'Define what recruited practices must do and our legal posture','Maria','Kellie, Puja','Hassan','','2026-12-10','',NS,''),
R(LG,'Guidance for sellers on practices already enrolled with these entities','Maria','Kellie, Puja','Hassan','','2027-01-15','Before recruiting',NS,'Must be done before sales outreach.'),
R(LG,'HARD GATE: no practice outreach until legal clears it','Maria','Kellie','Puja, Hassan','','2026-12-10','Dec 10 gate',NS,'No WellMed outreach before the legal map clears.'),
R(LG,'Legal sign-off on advances/bonuses (FMV, anti-kickback)','Maria','Kellie, Harrison','Amber','','2026-12-21','Before board',NS,'Phase 0 deliverable.'),
// Recruitment (Puja v2 plan)
R(RC,'Finalise qualifier list ($14.5K floor, routing) and 3-slide pitch','Puja','Puja','Anwar','2026-11-20','2026-11-26','',IP,'Phase 0.'),
R(RC,'Vision doc v1 (Puja sends framework material)','Anwar','Puja','','2026-11-20','2026-11-26','',IP,''),
R(RC,'Verified PUF/PECOS pull incl. Methodist row','Najeeb','Hassan','Puja','2026-11-20','2026-11-26','',IP,'Sizes are estimates until this lands.'),
R(RC,'Consolidate target practices into 2027 recruitment plan and target list','Hassan','Najeeb','Puja','2026-11-24','2027-01-15','Before recruiting',NS,'Recruitment starts early 2027.'),
R(RC,'Florence sales-leader debrief','Puja','Anwar','','2026-12-05','2026-12-05','',NS,''),
R(RC,'Board ideation sessions','Anwar','Puja','','2026-12-01','2026-12-03','',NS,''),
R(RC,'Florence on-site: qualification equation, 71K refresh, per-TIN model SLA','Puja','Najeeb','Florence','2026-12-08','2026-12-09','',NS,'Also add rebase model (15/22/30K) to agenda.'),
R(RC,'Tier A anchor shortlist (10 names)','Puja','Najeeb','Anwar','2026-12-08','2026-12-12','',NS,''),
R(RC,'Bonus / PMPM / pod financial model v1','Amber','Puja','Anwar','2026-12-01','2026-12-12','',NS,''),
R(RC,'First Florence per-TIN model batch reviewed','Puja','Najeeb','Florence','2026-12-15','2026-12-19','',NS,''),
R(RC,'Finalise product (Partner Path)','Puja, Anwar','Puja','Amber, Maria','2026-11-24','2026-12-21','',IP,''),
R(RC,'Sales job descriptions and sales leader requisition','Puja, Anwar','Puja','Hassan','2026-11-30','2026-12-21','',NS,''),
R(RC,'BOARD Dec 21: plan, 3 scenarios, budget, pod 1, sales leader, equity direction','Anwar','Puja','Amber, Hassan','2026-12-15','2026-12-21','',NS,'Milestone.'),
R(RC,'Confirm PY2028 filing calendar with Florence','Puja','Florence','Hassan','2026-12-01','2027-01-15','',NS,'Sales plan runs backward from it.'),
R(RC,'Hire sales leader','Puja, Anwar','Anwar','Hassan','2027-01-01','2027-01-31','Jan 2027',NS,''),
R(RC,'Hire and train 5 sellers (3 PHX, 2 DFW)','Puja, Anwar','Puja','Hassan','2027-01-15','2027-03-31','By March',NS,''),
R(RC,'Lighthouse: 5 hand-picked practices (only after legal clearance)','Puja','Najeeb','Maria, Kellie','2027-01-01','2027-03-31','',NS,'Phase 1.'),
R(RC,'Onboarding runbook and pod playbook v1','Puja','Hassan','Anwar','2027-03-01','2027-03-31','',NS,''),
R(RC,'Scale phase: ~25-30 signings; 2 anchors per quarter','Puja, Anwar','Puja','Hassan','2027-04-01','2027-08-31','',NS,'Phase 2. Pause sales if pods fall a full pod behind.'),
R(RC,'Cliff: executed agreements and clean PECOS for July participant deadline','Puja','Najeeb','Hassan','2027-06-01','2027-07-31','~July',NS,'Late signings go to PY2029.'),
R(RC,'Lock roster; onboarding sprint for every practice','Puja','Hassan','Najeeb','2027-09-01','2027-12-15','',NS,'Phase 3.'),
R(RC,'December board: final roster, PY2028 pool, 2028 PMPM budget','Anwar','Puja','Amber','2027-12-01','2027-12-15','December',NS,'')
];
module.exports={items:rows.map((x,i)=>({id:'I'+String(i+1).padStart(3,'0'),...x}))};
