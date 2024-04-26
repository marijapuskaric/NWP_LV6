var express = require('express');
var router = express.Router();
var mongoose = require('mongoose');
var Project = require('../model/projects');
var ProjectUser = require('../model/projectUser');
var db = require('../model/db');

//ruta za prikaz pocetne stranice sa svim projektima
//ukljucuje dohvacanje svih clanova i postavljanje formata datuma za prikaz
router.get('/', async (req, res, next) => 
{
  try 
  {
    const projects = await Project.find();
    for (let project of projects) 
    {
      const members = await ProjectUser.find({ projectId: project._id });
      project.members = members;

      var startDate = project.startDate.toISOString();
      project.start_date = startDate.substring(0, startDate.indexOf('T'));
      var endDate = project.endDate.toISOString();
      project.end_date = endDate.substring(0, endDate.indexOf('T'));
    }
    res.render('index', { title: 'Projects', projects: projects });
  } 
  catch (err) 
  {
    console.error('Error fetching projects:', err);
    res.status(500).send('Error fetching projects');
  }
});

//ruta za prikaz stranice sa formom za dodavanje novog projekta
router.get('/create-project', function(req, res) 
{
  res.render('createProject', { title: 'Add new project' });
});

//ruta za stvaranje novog projekta
//uzima podatke iz forme, stvara novi projekt te ga sprema u bazu podataka
router.post('/create-project', async (req, res) => 
{
  var name = req.body.name;
  var description = req.body.description;
  var price = req.body.price;
  var finishedTasks = req.body.finishedTasks;
  var startDate = req.body.startDate;
  var endDate = req.body.endDate;

  const newProject = new Project
  ({
    name: name,
    description: description,
    price: price,
    finishedTasks: finishedTasks,
    startDate: startDate,
    endDate: endDate
  });
  try 
  {
    const savedProject = await newProject.save();
    res.redirect('/');
  } 
  catch (err) 
  {
    console.error(err); 
    res.status(500).send("Error inserting project data"); 
  }
});

//ruta za prikaz stranice sa formom za uredivanje postojeceg projekta
//predaje se id projekta te se u formi prikazuju trenutni podatci o tom projektu koji se mogu izmijeniti
//ukljucuje formatiranje datuma za prikaz
router.get('/edit-project/:id', async function(req, res) 
{
  try 
  {
    const project = await Project.findById(req.params.id);

    var startDate = project.startDate.toISOString();
    startDate = startDate.substring(0, startDate.indexOf('T'));
    var endDate = project.endDate.toISOString();
    endDate = endDate.substring(0, endDate.indexOf('T'));
    res.render('editProject', 
    {
      title: 'Edit project ',
      "startDate" : startDate,
      "endDate" : endDate,
      "project" : project
    });
  }
  catch
  {
    console.error('Error fetching project:', err);
    res.status(500).send('Error fetching project');
  }
});

//ruta za update podataka o projektu u bazi podataka
//uzima podatke iz forme te pronalazi taj projekt u bazi i postavlja njegove nove podatke
router.post('/edit-project/:id', async (req,res) => 
{
  var id = req.body._id;
  var name = req.body.name;
  var description = req.body.description;
  var price = req.body.price;
  var finishedTasks = req.body.finishedTasks;
  var startDate = req.body.startDate;
  var endDate = req.body.endDate;
  try 
  {
    const project = await Project.findById(id);
    await project.updateOne
    ({
      name : name,
      description : description,
      price : price,
      finishedTasks : finishedTasks,
      startDate : startDate,
      endDate : endDate
    });
    res.redirect('/');
  }
  catch (err) 
  {
    console.error(err); 
    res.status(500).send("Error updating project data"); 
  }
});

//ruta za brisanje projekta iz baze podataka
//prima id projekta, pronalazi ga u bazi te brise
router.post('/delete-project/:id', async (req,res) => 
{
  try 
  {
    const project = await Project.findByIdAndDelete(req.params.id);
    res.redirect('/');
  } 
  catch (err) 
  {
    console.error(err); 
    res.status(500).send("Error deleting project"); 
  }
});

//ruta za prikaz stranice sa formom za dodavanje novog clana tima
//prima id projekta
router.get('/add-teammember/:id', async function(req, res) 
{
  try 
  {
    const project = await Project.findById(req.params.id);
    res.render('addTeamMember', { title: 'Add team member' ,"project" : project});
  }
  catch
  {
    console.error('Error fetching project:', err);
    res.status(500).send('Error fetching project team member');
  }
});

//ruta za spremanje novog clana tima u bazu
//uzima podatke iz forme (id projekta i korisnika) te sprema te podatke u bazu podataka (kolekcija projectusers)
router.post('/add-teammember/:id', async (req,res) => 
{
  var projectId = req.body.projectId;
  var user = req.body.user;

  const newProjectUser = new ProjectUser
  ({
    projectId: projectId,
    user: user,
  });
  try 
  {
    const savedProjectUser = await newProjectUser.save();
    res.redirect('/');
  } 
  catch (err) 
  {
    console.error(err); 
    res.status(500).send("Error adding a new team member"); 
  }
});

//ruta za brisanje clana tima s projekta
//prima id projectUser-a, pronalazi ga u bazi i brise
router.post('/delete-projectUser/:id', async (req,res) => 
{
  try 
  {
    const projectUser = await ProjectUser.findByIdAndDelete(req.params.id);
    res.redirect('/');
  }
  catch (err) 
  {
    console.error(err); 
    res.status(500).send("Error deleting project user"); 
  }
});

module.exports = router;