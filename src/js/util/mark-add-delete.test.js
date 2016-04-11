/* eslint no-unused-expressions:0 */
'use strict';
var expect = require('chai').expect;
var model = require('../model'),
    markUtils = require('./mark-add-delete');

describe.skip('Mark Utilities', function() {
  var group, mark;
  beforeEach(function(){
    // model.init();
    group = model.Scene.child('marks.group');
    mark = group.child('marks.text');
  });
  describe('getParent', function() {

    it('if current selection is a group and you are adding to it, return selected', function() {
      var parent = markUtils.getParent(true, group._id);
      expect(parent).to.equal(group);
    });

    it('if current selection is not a group, return its parent', function() {
      var parent = markUtils.getParent(true, mark._id);
      expect(parent).to.equal(group);
    });

    it('if selected id does not exist, default to model.Scene', function() {
      var parent = markUtils.getParent(true);
      expect(parent).to.equal(model.Scene);
    });
  });

  describe('addMark', function() {
    it('adding a mark to a selected group adds it to the group', function() {
      var newMark = markUtils.addMark('text', group._id);
      expect(group.marks).to.contain(newMark._id);
    });

    it('adding a mark to a selected mark adds it to the mark\'s parent', function() {
      var testMark = group.child('marks.text');
      var newMark = markUtils.addMark('text', testMark._id);
      expect(group.marks.length).to.equal(3);
      expect(group.marks).to.contain(newMark._id);
    });

    it('adding a mark when nothing is selected adds it to the model.scene by default', function() {
      var newMark = markUtils.addMark('text');
      expect(model.Scene.marks.length).to.equal(2);
      expect(model.Scene.marks).to.contain(newMark._id);
    });
  });

  describe('deleteMark', function() {
    it('deleting a mark removes it from its parent', function() {
      markUtils.deleteMark(group._id);
      expect(model.Scene.marks.length).to.equal(0);
      expect(model.Scene.marks).to.not.contain(group._id);
    });
  });

  describe('clearMarks', function() {
    it('clearing a scene removes all marks from the scene', function() {
      markUtils.clearMarks();
      expect(model.Scene.marks.length).to.equal(0);
    });
  });

  describe('selectScene', function() {
    it('store will set selected mark to scene id', function() {
      var sceneId = markUtils.getSceneId();
      expect(sceneId).to.equal(model.Scene._id);
    });
  });
});
