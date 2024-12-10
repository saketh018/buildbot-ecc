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
        BuilderName: '',
        BranchName: '',
        schedulerName: '',
        repoUrl: '',
        workingDirectory: ''
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
            <label htmlFor="builderName" style={{ display: 'block', marginBottom: '5px' }}>
              Builder Name
            </label>
            <input
              type="text"
              id="BuilderName"
              name="BuilderName"
              value={formData.BuilderName}
              onChange={handleChange}
              style={{ width: '100%', padding: '8px' }}
            />
          </div>
          <div style={{ marginBottom: '10px' }}>
            <label htmlFor="branchName" style={{ display: 'block', marginBottom: '5px' }}>
              Branch Name
            </label>
            <input
              type="text"
              id="BranchName"
              name="BranchName"
              value={formData.BranchName}
              onChange={handleChange}
              style={{ width: '100%', padding: '8px' }}
            />
          </div>
          <div style={{ marginBottom: '10px' }}>
            <label htmlFor="schedulerName" style={{ display: 'block', marginBottom: '5px' }}>
              Scheduler Name
            </label>
            <input
              type="text"
              id="schedulerName"
              name="schedulerName"
              value={formData.schedulerName}
              onChange={handleChange}
              style={{ width: '100%', padding: '8px' }}
            />
          </div>
          <div style={{ marginBottom: '10px' }}>
            <label htmlFor="repoUrl" style={{ display: 'block', marginBottom: '5px' }}>
              Repo Url
            </label>
            <input
              type="text"
              id="repoUrl"
              name="repoUrl"
              value={formData.repoUrl}
              onChange={handleChange}
              style={{ width: '100%', padding: '8px' }}
            />
          </div>
          <div style={{ marginBottom: '10px' }}>
            <label htmlFor="workingDirectory" style={{ display: 'block', marginBottom: '5px' }}>
            Working Directory
            </label>
            <input
              type="text"
              id="workingDirectory"
              name="workingDirectory"
              value={formData.workingDirectory}
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
          <h2>Configuration</h2>
          <SimpleForm></SimpleForm>
        </Card.Body>
      </Card>
    </div>
  )
});

buildbotSetupPlugin((reg) => {
    reg.registerMenuGroup({
        name: 'config',
        parentName: 'builds',
        caption: 'Config',
        order: null,
        route: '/config',
      });

  reg.registerRoute({
    route: "config",
    group: "config",
    element: () => <AboutView/>,
  });
});
