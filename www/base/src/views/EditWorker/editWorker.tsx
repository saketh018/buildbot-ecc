/*
  This file is part of Buildbot.  Buildbot is free software: you can
  redistribute it and/or modify it under the terms of the GNU General Public
  License as published by the Free Software Foundation, version 2.

  This program is distributed in the hope that it will be useful, but WITHOUT
  ANY WARRANTY; without even the implied warranty of MERCHANTABILITY or FITNESS
  FOR A PARTICULAR PURPOSE.  See the GNU General Public License for more
  details.

  You should have received a copy of the GNU General Public License along with
  this program; if not, write to the Free Software Foundation, Inc., 51
  Franklin Street, Fifth Floor, Boston, MA 02110-1301 USA.

  Copyright Buildbot Team Members
*/

import {observer} from "mobx-react";
import {Card} from "react-bootstrap";
import {buildbotSetupPlugin} from "buildbot-plugin-support";
import {useState} from "react";
import { RestClient } from "buildbot-data-js";

export const AboutView = observer(() => {
  const restClient = new RestClient('http://149.165.154.180:8010/api/v2/');
  const endpoint = "master/config"; 

  const SimpleForm = () => {
    const [formData, setFormData] = useState({
        WorkerName: '',
        WorkerPassword: '',
        tags: '',
    });
  
    const handleChange = (e:any) => {
     const { name, value } = e.target;
      setFormData({ ...formData, [name]: value });
    };

    const handleSubmit = async (e: any) => {
      e.preventDefault();
  
      const payload = {
        jsonrpc: "2.0",
        method: "updateMasterConfig",
        params: formData,
        id: 1
      };
  
      try {
        console.log("Submitting payload:", payload);
        const response = await restClient.post(endpoint, payload);
        console.log("Response from server:", response);
        alert("Configuration updated successfully!");
      } catch (error) {
        console.error("Error updating configuration:", error);
        alert("Failed to update configuration. Please try again.");
      }
    };
  
    return (
      <div style={{ maxWidth: '400px', padding: '20px 0px' }}>
        <form onSubmit={handleSubmit}>
          <div style={{ marginBottom: '10px' }}>
            <label htmlFor="workerName" style={{ display: 'block', marginBottom: '5px' }}>
              Worker Name
            </label>
            <input
              type="text"
              id="WorkerName"
              name="WorkerName"
              value={formData.WorkerName}
              onChange={handleChange}
              style={{ width: '100%', padding: '8px' }}
            />
          </div>
          <div style={{ marginBottom: '10px' }}>
            <label htmlFor="WorkerPassword" style={{ display: 'block', marginBottom: '5px' }}>
              Worker Password
            </label>
            <input
              type="text"
              id="WorkerPassword"
              name="WorkerPassword"
              value={formData.WorkerPassword}
              onChange={handleChange}
              style={{ width: '100%', padding: '8px' }}
            />
          </div>
          <div style={{ marginBottom: '10px' }}>
            <label htmlFor="tags" style={{ display: 'block', marginBottom: '5px' }}>
              Tags
            </label>
            <input
              type="text"
              id="tags"
              name="tags"
              value={formData.tags}
              onChange={handleChange}
              style={{ width: '100%', padding: '8px' }}
            />
          </div>
          <button type="submit" style={{ padding: '10px 20px', background: 'blue', color: 'white', border: 'none' }}>
            Submit
          </button>
        </form>
      </div>
    );
  };

  return (
    <div className="container bb-about-view">
      <Card bg="light">
        <Card.Body>
          <h2>Edit Worker</h2>
          <SimpleForm></SimpleForm>
        </Card.Body>
      </Card>
    </div>
  )
});

buildbotSetupPlugin((reg) => {
    reg.registerMenuGroup({
        name: 'editWorker',
        parentName: 'builds',
        caption: 'Edit Worker',
        order: null,
        route: '/editworker',
      });

  reg.registerRoute({
    route: "editworker",
    group: "editworker",
    element: () => <AboutView/>,
  });
});
