
const actions = ["create", "view", "update", "delete"];
const resources = ["course", "review", "users", "assignment", "enrollment", "submission", "attendance", "grade"];

const roles = {
    admin: {
        course: { create: true, view: true, update: true, delete: true, approval: true },
        review: { delete: "all"},
        batch: { view: "all", create: true, update: "all", delete: "all" },
        users: { view: "all", delete: "all", update: "own" },
        enrollment: { view: "all" },
        assignment: {create: true, view: "all", update: "all", delete: "all" },
        submission: { create: false, view: "all", delete: "all" },
        attendance: { create: true, view: "all", update: "all" },
        grade: { create: "all", view: "all", update: "all", delete: "all" }
    },
    teacher: {
        course: { view: true },
        review: { delete: "own"},
        batch: { view: "team", create: true },
        users: { view: "team", delete: "own", update: "own" },
        enrollment: { view: "all" },
        assignment: {create: true, view: "team", update: "team", delete: "team"},
        submission: { create: false, view: "team" },
        attendance: { create: true, view: "all", update: "team" },
        grade: { create: "team", view: "team", update: "team", delete: "team" }
    },
    student: {
        course: { view: true },
        review: { delete: "own"},
        batch: { view: "own" },
        users: { view: "own", delete: "own", update: "own" },
        enrollment: {create: true, view: "own"},
        assignment: {view: "own"},
        submission: { create: true, view: "own", delete: "own" },
        attendance: { view: "own" },
        grade: { view: "own" }
    }
}

module.exports = {
    actions,
    resources,
    roles
};