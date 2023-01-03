# tmpl-followup - Follow your template repo for changes

## Why
When you create a new repo from a github template repo, you lose the connection to the parent via commits. Later, when you want to transfer the changes, you can only think about manual methods. Or you can use tmpl-followup.

## How
You can easily link the two repos on your machine. After that, tmpl-followup shows you the differences that you can transfer in **one direction**: you can move the differences from the source repo to the target repo.

---

## First run

After you have updated (```git pull```) the source repo on your computer, run the npx command.

```
npx tmpl-followup
```

The first time it will ask you to create your ```.tmpl-followuprc``` file in your home folder, where you can configure your personal diff tool. Answer yes.

```
[TMPL-FOLLOWUP] Follow template repo
Cannot find your .tmpl-followuprc in home folder. This is necessary for diff.
? Create a /[USER]/.tmpl-followuprc file? (y/N) › true
```

Modify the ```.tmpl-followuprc``` file to use VScode for diffing, for example.

## Configuration
Go to the folder where your **target repo** is. Here you will need a ```tmpl-followup.json``` configuration file. It might look like this, and this can be part of git repo (for all developers): 
```
{
  "templateFolder": "../template-folder",
  "templateId": "tmpl-repo",
  "repoId": "repo-repo",
  "exclude": [
    "example-folder",
    "package-lock.json",
    ...
  ]
}
```
**templateFolder**: this is a mandatory field, you will do the comparisons from this folder.

**templateId**: source repo ID (by default the name field of source package.json)

**repoId**: target repo ID (by default the name field in target package.json)

**exclude**: files to exclude from the source repo (default is the .gitignore file of the source repo)

## What is templateId and repoId?
The templateId and repoId are a very important element of the operation. When you copy the repo, you change its name. You may also create files with the same name / containing names as the new repo.

During the comparison, followup always makes sure to replace the templateId with the repoId and compare the files that way. For example, if the value of templateId is ms-starter and the value of repoId is ms-my1st-repo, then the following two files will be identical:
```
const appName = 'ms-starter';
console.log(`Hello ${appName}`);
```

```
const appName = 'ms-my1st-repo';
console.log(`Hello ${appName}`);
```

If the file does not already exist, followup can create the file. During creation, it also replaces the templateId with the repoId in the new file.

If the two repos differ only by that much, it considers the two repos to be the same.

## Configuration Ex
If the owner of the source repo wants to **help your work**, he can also place a ```tmpl-followup.json``` file in the source repo, in which he can enter the values, in which case you need to enter **only the templateFolder** setting.

----

## Hide files
Hiding files is a useful trick for followup. When there is a file in the source system that you do not want to transfer (in its entirety) to the target repo, you can choose the option to hide this file. In any case, it hides the **current version** of the file (it stores the corresponding hash). When this file of the source repo **changes in the future**, the system will show it again for comparison (and it can be hidden again with the new hash)

ps: There are cases when you take certain changes (with diff tool) but hide the rest.

----

## Command line
The system can also be operated with command line switches.

**-f** the target repo folder where we want to apply the changes.

**--hidden** show hidden files too.