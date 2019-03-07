workflow "Publish to NPM" {
  on = "push"
  resolves = ["GitHub Action for npm"]
}

action "Tag" {
  uses = "actions/bin/filter@master"
  args = "tag"
}

action "GitHub Action for npm" {
  needs = "Tag"
  uses = "actions/npm@59b64a598378f31e49cb76f27d6f3312b582f680"
  secrets = ["NPM_AUTH_TOKEN"]
  args = "publish"
}
