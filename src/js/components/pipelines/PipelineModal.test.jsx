'use strict';

var React = require('react'),
    expect = require('chai').expect,
    configureMockStore = require('redux-mock-store'),
    dl = require('datalib'),
    enzyme = require('enzyme'),
    shallow = enzyme.shallow,
    PipelineModal = require('./PipelineModal').disconnected,
    DataURL = require('./DataURL'),
    RawValuesTextArea = require('./RawValuesTextArea'),
    Modal = require('react-modal');

var MOCK_DATA = require('./../../constants/mockdata');

describe.skip('PipelineModal component <PipelineModal/> ', function() {
  var mockStore, wrapper, props;

  beforeEach(function() {
    mockStore = configureMockStore([]);
  });

  // Suite that checks for proper parsing of csv, tsv and json
  describe('Raw value parsing', function() {
    var parseRaw, dataset, raw, invalidRaw, parsed,
        schema, verifySchemaExpectations;

    beforeEach(function() {
      props = {
        closeModal: function() {},
        modalIsOpen: true
      };
      wrapper = shallow(<PipelineModal {...props} />, {
        context: {store: mockStore({})}
      });
      parseRaw = wrapper.instance().parseRaw;
      schema = wrapper.instance().schema;
      dataset = {
        format: {parse: 'auto', type: ''},
        name: 'name'
      };
      verifySchemaExpectations = function(processedSchema) {
        for (var k in processedSchema) {
          if (processedSchema.hasOwnProperty(k)) {
            expect(processedSchema[k]).to.have.property('name')
              .and.not.equal('');
            expect(processedSchema[k]).to.have.property('type')
              .and.not.equal('');
            expect(processedSchema[k]).to.have.property('mtype')
              .and.not.equal('');
          }
        }
      };
    });

    it('parses valid json', function() {
      raw = MOCK_DATA.VALID_JSON;
      dataset.format.type = 'json';
      parsed = dl.read(raw, dataset.format);
      expect(parseRaw(raw, dataset)).to.eql(parsed);
    });
    it('throws on invalid json', function() {
      invalidRaw = MOCK_DATA.INVALID_JSON;
      dataset.format.type = 'json';
      expect(function() {
        parseRaw(invalidRaw, dataset);
      }).to.throw(Error);
    });
    it('correctly parses csv', function() {
      raw = MOCK_DATA.VALID_CSV;
      dataset.format.type = 'csv';
      parsed = dl.read(raw, dataset.format);
      expect(parseRaw(raw, dataset)).to.eql(parsed);
    });
    it('throws on invalid csv', function() {
      invalidRaw = MOCK_DATA.INVALID_CSV;
      dataset.format.type = 'csv';
      parsed = dl.read(raw, dataset.format);
      expect(function() {
        parseRaw(invalidRaw, dataset);
      }).to.throw(Error);
    });
    it('correctly parses tsv', function() {
      dataset.format.type = 'tsv';
      raw = MOCK_DATA.VALID_TSV;
      parsed = dl.read(raw, dataset.format);
      expect(parseRaw(raw, dataset)).to.eql(parsed);
    });
    it('throws on invalid tsv', function() {
      dataset.format.type = 'tsv';
      invalidRaw = MOCK_DATA.INVALID_TSV;
      expect(function() {
        parseRaw(invalidRaw, dataset);
      }).to.throw(Error);
    });

    it('calculates json schema', function() {
      var json = JSON.parse(MOCK_DATA.VALID_JSON);
      verifySchemaExpectations(schema(json));
    });

    it('calculates csv schema', function() {
      var csv = MOCK_DATA.VALID_CSV;
      verifySchemaExpectations(schema(csv));
    });

    it('calculates tsv schema', function() {
      var csv = MOCK_DATA.VALID_TSV;
      verifySchemaExpectations(schema(csv));
    });

    it('loads data from url');
    it('loads data from copy & paste');
    it('loads data through drag & drop');
  });

  describe('Dispatchers', function() {
    beforeEach(function() {
      props = {
        closeModal: function() {},
        modalIsOpen: true
      };

      wrapper = shallow(<PipelineModal {...props} />, {
        context: {store: mockStore({})}
      });
    });

    it('selects pipelines');
  });

  describe('Default ui', function() {
    beforeEach(function() {
      props = {
        closeModal: function() {},
        modalIsOpen: true
      };

      wrapper = shallow(<PipelineModal {...props} />, {
        context: {store: mockStore({})}
      });
    });

    it('has <Modal/> component', function() {
      expect(wrapper.find(Modal)).to.have.length(1);
    });
    it('has <Form/> component', function() {
      expect(wrapper.find(DataURL)).to.have.length(1);
    });
    it('has <TextArea/> component', function() {
      expect(wrapper.find(RawValuesTextArea)).to.have.length(1);
    });
  });
});
