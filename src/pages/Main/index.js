import React, { Component } from 'react'
import { FaGithubAlt, FaPlus, FaSpinner } from 'react-icons/fa';
import { Link } from 'react-router-dom';

import api from '../../services/api';

import Container from '../../components/Container';
import { Form, SubmitButton, List, Input, ErrorMessage } from './styles';

export default class Main extends Component {
  state = {
    newRepo: '',
    repositories: [],
    loading: false,
    error: '',
  };

  // Carregar os dados do localStorage
  componentDidMount(){
    const repositories = localStorage.getItem('repositories');

    if(repositories){
      this.setState({ repositories: JSON.parse(repositories) });
    }else {
      this.setState({
        repositories: [{ name: 'twbs/bootstrap' }],
      });
    }
  }

  //Salvar os dados do localStorage
  componentDidUpdate(_, prevState) {
    const { repositories } = this.state;

    if(prevState.repositories !== repositories){
      localStorage.setItem('repositories', JSON.stringify(repositories));
    }
  }

  handleInputChange = e => {
    this.setState({ newRepo: e.target.value, error: false });
  };

  handleSubmit = async e => {
    e.preventDefault();

    this.setState({ loading: true });

    try {
      const { newRepo, repositories } = this.state;

      const response = await api.get(`/repos/${newRepo}`);

      const data = {
        name: response.data.full_name,
      }

      if (repositories.find(repo => repo.name === data.name)) {
        throw new Error('Repositório duplicado');
      }

      this.setState({
        repositories: [...repositories, data],
        newRepo: '',
        loading: false,
        error: '',
      })
    } catch(err) {
      this.setState({
        loading: false,
        error: err.message.includes('404') ? 'Repository not found' : err.message,
      });
    }


  };

  render(){
    const { newRepo, repositories, loading, error } = this.state;

    return (
      <Container>
        <h1>
          <FaGithubAlt/>
          Repositórios
        </h1>

        <Form onSubmit={this.handleSubmit}>
          <Input
            type="text"
            placeholder="Adicionar repositório"
            value={ newRepo }
            onChange={this.handleInputChange}
            error={error}>
          </Input>

          <SubmitButton loading={loading}>
            { loading ? <FaSpinner color="#FFF" size={14}/> : <FaPlus color="#FFF" size={14} /> }
          </SubmitButton>
        </Form>

        <ErrorMessage>
          { error && <div className="error">{error}</div> }
        </ErrorMessage>

        <List>
          {repositories.map(repository => (
            <li key={repository.name}>
              <span>{repository.name}</span>
              <Link to={`/repository/${encodeURIComponent(repository.name)}`}>Detalhes</Link>
            </li>
          ))}
        </List>
      </Container>
    );
  }

}