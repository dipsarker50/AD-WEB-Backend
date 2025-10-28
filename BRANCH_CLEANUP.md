# Delete Sourav Branch - Action Required

## Branch to be Deleted: `Sourav`

This PR documents the request to delete the `Sourav` branch from the repository.

**Branch Details:**
- **Name:** `Sourav`
- **SHA:** 7f1dc33d3827df68df3abb663b7051a945884bd0
- **Last Commit:** "setup"

## Action Required After Merging This PR

Once this PR is merged, the repository administrator should delete the `Sourav` branch using one of the following methods:

### Method 1: Using Git Command Line
```bash
git push origin --delete Sourav
```

### Method 2: Using GitHub Web Interface
1. Navigate to: https://github.com/dipsarker50/AD-WEB-Backend/branches
2. Locate the `Sourav` branch in the list
3. Click the trash/delete icon next to it
4. Confirm the deletion

### Method 3: Using GitHub CLI
```bash
gh api -X DELETE /repos/dipsarker50/AD-WEB-Backend/git/refs/heads/Sourav
```

## Verification

After deletion, verify the branch is removed by running:
```bash
git ls-remote --heads origin | grep Sourav
```

This should return no results if the deletion was successful.

---

**Note:** There is also a `Sourov` branch in the repository (alternative spelling). Please confirm if this branch should also be deleted.
