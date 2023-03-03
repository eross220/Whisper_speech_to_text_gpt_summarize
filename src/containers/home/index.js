import React from 'react'
import axios from 'axios'

export default class Home extends React.Component{
  login = () => {
    this.props.history.push('/login')
  }
  constructor(props){
		super(props);

		this.state={
        recordingURL:'',
        campaignName:'',
        calldata:'',
        load1:false,
        load2:false,
        summarizeData:'',
		}

	}
  onChange = (key,e) => {
		// let {form} = this.state;
		// form[key] = e.target.value
		
	}

  handleChange1 = (e) => {
    console.log(this.state)
    this.setState({...this.state, recordingURL: e.target.value})
  }

  handleChange2 = (e) => {
    console.log(this.state)
    this.setState({...this.state, campaignName: e.target.value})
  }

  handleChange3 = (e) => {
    console.log(this.state)
    this.setState({...this.state, input3: e.target.value})
  }

  handleChange4 = (e) => {
    console.log(this.state)
    this.setState({...this.state, input4: e.target.value})
  }

  handleSubmitData = () => {
    if(this.state.recordingURL == '') {
      alert("please input the recordingURL")
    }
    if(this.state.campaignName == '') {
      alert("please input the campaignName")
    }
    // if(this.state.input3 == '') {
    //   alert("please input the input3")
    // }
    // if(this.state.input4 == '') {
    //   alert("please input the input4")
    // }
    this.setState({...this.state, load1: true});
    let self = this;
    axios.post(`http://localhost:3003/api/webhook`,{"RecordingURL":self.state.recordingURL})
		  .then(function (response) {
        const text = response.data.response.text;
        self.setState({...self.state, calldata:text,load1: false});
        self.setState({...self.state, load1: false});
		  })
		  .catch(function (error) {
		    console.log(error);
        self.setState({...self.state, load1: false});
		  });
    return;
  }

  handleSubmitSummarizeDdata = ()=> {
    if(this.state.calldata == '') {
      alert("please get the call dadta")
      return;
    }
    this.setState({...this.state, load2: true});
    let self = this;
    axios.post(`http://localhost:3003/api/summarize`,{"prompt":self.state.calldata})
		  .then(function (response) {
        const text = response.data.answer.response;
        self.setState({...self.state, summarizeData:text,load2: false});
        self.setState({...self.state, load2: false});
		  })
		  .catch(function (error) {
		    console.log(error);
        self.setState({...self.state, load2: false});
		  });
    return;
  }

  render(){
    return(
        <div className='container'>
          <div className='' style={{"marginTop": "50px"}}>
              <div className='text-center'>
                <h1>Call Recording Summarize</h1>
              </div>
              <label>Recording URL:&nbsp;</label>
              <input type="text"  placeholder='https://example.com/users/'  class="form-control input-lg" value={this.state.recordingURL} onChange={this.handleChange1.bind(this)} required/><p/>
           

            <label>Campagn Name:&nbsp;</label>
            <input type="text" placeholder='campaign Name'  class="form-control input-lg" value={this.state.campaignName} onChange={this.handleChange2.bind(this)} required/><p/>

            <div className='text-center'>
              {this.state.load1?<button type="button" class="btn btn-success"> <i className="fa fa-spinner fa-spin"></i>Loading</button>:<button type="button" class="btn btn-success" onClick={this.handleSubmitData.bind(this)}>Get Data</button>}
            </div>
           
          </div>
          <div className="form-group">
            <label htmlFor="exampleFormControlTextarea1">Recording Data</label>
            <textarea
              className="form-control"
              id="record_text"
              rows="5"
              value={this.state.calldata}
              class="form-control"
              disabled
            />
          </div>

          <div className='text-center'>
            {this.state.load2?<button type="button" class="btn btn-success"> <i className="fa fa-spinner fa-spin"></i>Loading</button>:<button type="button" class="btn btn-success" onClick={this.handleSubmitSummarizeDdata.bind(this)}>Summarize</button>}
          </div>
          
          <p/>
          <div className="form-group">
            <label htmlFor="sumarize_text">Sumarize Data</label>
            <textarea
              className="form-control"
              id="exampleFormControlTextarea"
              rows="5"
              value={this.state.summarizeData}
              disabled
              class="form-control"
            />
          </div>
        </div>
      )
  }
 } 
