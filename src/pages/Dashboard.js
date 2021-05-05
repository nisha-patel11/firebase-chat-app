import React, { Component } from "react";
import Header from "../components/Header";
import { auth } from "../services/firebase";
import { db } from "../services/firebase";
import { Link } from "react-router-dom";

class Dashboard extends Component {
  constructor(props) {
    super(props);
    this.state = {
      groups: [],
      content: "",
      readError: null,
      writeError: null,
      loadingChats: false,
    };
    this.myRef = React.createRef();
  }

  async componentDidMount() {
    this.setState({ readError: null, loadingChats: true });
    const chatArea = this.myRef.current;
    try {
      let groups = [];

      db.ref().on("value", function (snapshot) {
        if (snapshot.val() !== null) {
          groups = Object.keys(snapshot.val());
          // console.log(groups);
        }
      });

      this.setState({ groups: groups });
    } catch (error) {
      this.setState({ readError: error.message, loadingChats: false });
    }
  }
  render() {
    return (
      <div>
        <Header />
        <div className="home">
          {this.state.groups.length > 0 ? (
            this.state.groups.map((item) => {
              return (
                <div className="chat-groups">
                  <Link to={{ pathname: `/chat`, state: item }}>{item}</Link>
                </div>
              );
            })
          ) : (
            <div className="chat-groups">No chat available</div>
          )}
        </div>
      </div>
    );
  }
}

export default Dashboard;
