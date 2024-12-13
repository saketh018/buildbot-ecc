
# ECC Project Setup Guide

This document provides a step-by-step guide to setting up the customized Buildbot environment for your ECC project on Jetstream, including PostgreSQL integration, GitHub SSO configuration, and multi-user support. It also covers creating Buildbot master and workers on different instances, configuring Docker containers for multi-language builds, and running builds through the UI.

---

## Prerequisites

- Jetstream2 account with access to VM instances
- SSH client for accessing instances
- PostgreSQL database installed or access to an external PostgreSQL instance
- Docker installed on all Buildbot instances
- GitHub account with SSO enabled for repositories
- Buildbot source code with custom modifications from [https://github.com/saketh018/buildbot-ecc](https://github.com/saketh018/buildbot-ecc)
- Prometheus and Grafana installed for monitoring
- A Dockerfile for each project directory to encapsulate build steps and dependencies

---

## Step 1: Set Up Jetstream Instances

1. **Create VM Instances**:

   - Master Node: `vmudhapa-master-node`
   - Worker Nodes: `vmudhapa-worker-node-01`, `vmudhapa-worker-node-02`, etc.

2. **Access Each Instance**:

   ```bash
   ssh user@<instance_ip>
   ```

3. **Install Required Software**:

   - Install Docker:
     ```bash
     sudo apt update
     sudo apt install docker.io
     sudo systemctl enable docker
     sudo systemctl start docker
     ```
   - Install PostgreSQL on the Master Node:
     ```bash
     sudo apt install postgresql
     ```
   - Install Python:
     ```bash
     sudo apt install python3 python3-pip
     ```

4. **Install Customized Buildbot**:

   - Clone the customized Buildbot repository:
     ```bash
     git clone https://github.com/saketh018/buildbot-ecc.git
     ```
   - Navigate to the repository directory:
     ```bash
     cd buildbot-ecc
     ```
   - Install dependencies:
     ```bash
     pip install -r requirements.txt
     ```
   - Install Buildbot:
     ```bash
     python setup.py install
     ```

---

## Step 2: Set Up PostgreSQL Database

1. **Create the Database**:

   - Access the PostgreSQL shell:
     ```bash
     sudo -u postgres psql
     ```
   - Create a new database:
     ```sql
     CREATE DATABASE ecc_project;
     ```
   - Create a user:
     ```sql
     CREATE USER ecc_user WITH ENCRYPTED PASSWORD 'your_password';
     GRANT ALL PRIVILEGES ON DATABASE ecc_project TO ecc_user;
     ```

2. **Connect Buildbot to PostgreSQL**:

   - Update the `master.cfg` file:
     ```python
     c['db_url'] = 'postgresql+psycopg2://ecc_user:your_password@localhost/ecc_project'
     ```

3. **Install PostgreSQL Python Dependencies**:

   ```bash
   pip3 install psycopg2
   ```

---

## Step 3: Configure GitHub SSO for Multi-User Support

1. **Generate OAuth App on GitHub**:

   - Go to `Settings > Developer Settings > OAuth Apps` on GitHub.
   - Create a new OAuth App with the following details:
     - Authorization Callback URL: `http://<master_node_ip>:8010/callback`

2. **Update `master.cfg` for GitHub Integration**:

   ```python
   from buildbot.plugins import auth

   c['www'] = {
       'auth': auth.OAuth2Auth(
           clientId="<your_client_id>",
           clientSecret="<your_client_secret>",
           apiUrl="https://api.github.com/user",
           authorizeUrl="https://github.com/login/oauth/authorize",
           tokenUrl="https://github.com/login/oauth/access_token"
       ),
       'authz': auth.RolesFromGroups(group_regex=r"<organization/group>")
   }
   ```

3. **Restart Buildbot**:

   ```bash
   buildbot restart master
   ```

---

## Step 4: Create Master and Workers

1. **Set Up Master**:

   - Initialize the master:
     ```bash
     buildbot create-master master
     ```
   - Replace the default `master.cfg` with your customized configuration.

2. **Set Up Workers**:

   - Initialize workers:
     ```bash
     buildbot-worker create-worker worker <master_node_ip>:9989 workername workerpassword
     ```
   - Start the worker:
     ```bash
     buildbot-worker start worker
     ```

---

## Step 5: Configure Docker Containers for Multi-User Support

1. **Install Docker Dependencies**:

   - Pull required container images for Java, C++, Python, and CUDA builds:
     ```bash
     docker pull openjdk
     docker pull gcc
     docker pull python
     docker pull nvidia/cuda
     ```

2. **Set Up Docker for Workers**:

   - Add workers to the `docker` group:
     ```bash
     sudo usermod -aG docker <worker_user>
     ```
   - Restart workers to apply changes.

---

## Step 6: Implement Polling for Repository Updates

1. **Configure Polling in `master.cfg`**:
   - Define the polling interval for fetching updates:
     ```python
     from buildbot.plugins import schedulers

     c['schedulers'] = [
         schedulers.Periodic(name="polling_scheduler", builderNames=["all_builders"], periodicBuildTimer=300),
     ]
     ```
2. **Restart Buildbot**:
   ```bash
   buildbot restart master
   ```
---

## Step 7: Integrate Prometheus and Grafana for Monitoring

1. **Install Prometheus and Grafana**:

   - Install Prometheus:
     ```bash
     sudo apt update
     sudo apt install prometheus
     ```
   - Install Grafana:
     ```bash
     sudo apt install grafana
     sudo systemctl enable grafana-server
     sudo systemctl start grafana-server
     ```

2. **Configure Prometheus for Buildbot Monitoring**:

   - Edit Prometheus configuration file (`/etc/prometheus/prometheus.yml`):
     ```yaml
     scrape_configs:
       - job_name: 'buildbot'
         static_configs:
           - targets: ['<master_node_ip>:<prometheus_port>']
     ```
   - Restart Prometheus:
     ```bash
     sudo systemctl restart prometheus
     ```

3. **Set Up Grafana Dashboards**:

   - Access Grafana at `http://<grafana_ip>:3000`.
   - Add Prometheus as a data source.
   - Import a dashboard template for Buildbot metrics or create custom dashboards to track:
     - Build times
     - Worker resource utilization
     - System health metrics

---

## Step 8: Run Builds Through the UI

1. **Access Buildbot Web Interface**:

   - Open the browser and navigate to `http://<master_node_ip>:8010`.

2. **Create New Builds**:

   - Log in using GitHub SSO.
   - Navigate to the `Schedulers` section and create new builds by selecting:
     - Project directory
     - Build configurations (e.g., Dockerfile path, language support)

3. **Monitor Builds**:

   - View real-time logs and build status on the UI.

---

## Troubleshooting

- **Database Connection Errors**:

  - Verify `master.cfg` for correct database credentials.
  - Ensure PostgreSQL is running and accessible.

- **Worker Connection Issues**:

  - Check firewall rules between master and worker nodes.
  - Verify the worker credentials match the `master.cfg` configuration.

- **GitHub SSO Failures**:

  - Ensure the OAuth app settings match the master node URL.

- **Monitoring Issues**:

  - Verify Prometheus and Grafana configurations for accurate metrics scraping and dashboard visualization.

---

## Conclusion
NOTE: This documentation/user guide is still a work in progress and will be updated frequently.
Following these steps, you can successfully set up and run your customized Buildbot environment for the ECC project on Jetstream. For additional help, refer to Buildbot's [official documentation](https://docs.buildbot.net).
