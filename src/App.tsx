import React, { useState } from 'react';
import './App.scss';

import cn from 'classnames';
import usersFromServer from './api/users';
import productsFromServer from './api/products';
import categoriesFromServer from './api/categories';

type User = {
  id: number;
  name: string;
  sex:string;
};
 type Category = {
   id: number;
   title: string;
   icon: string;
   ownerId: number;
   user: User | null;
 };

 type Product = {
   id: number;
   name: string;
   categoryId: number;
   category: Category | null;
 };

const getUserById = (ownerId: number) => usersFromServer
  .find(user => user.id === ownerId)
|| null;

const categories = categoriesFromServer.map(category => ({
  ...category,
  user: getUserById(category.ownerId),
}));

const getCategoryById = (categoryId: number) => categories
  .find(category => category.id === categoryId) || null;

const products = productsFromServer.map(product => ({
  ...product,
  category: getCategoryById(product.categoryId),
}));

export const App: React.FC = () => {
  const [selectedUserId, setSelectedUserId] = useState(0);

  const handleSelectUser = (userId: number) => {
    setSelectedUserId(userId);
  };

  const prepareProducts = (goods: Product[], userId: number) => (userId === 0
    ? goods
    : goods.filter(good => good.category?.user?.id === userId));

  const preparedProducts = prepareProducts(products, selectedUserId);

  return (
    <div className="section">
      <div className="container">
        <h1 className="title">Product Categories</h1>

        <div className="block">
          <nav className="panel">
            <p className="panel-heading">Filters</p>

            <p className="panel-tabs has-text-weight-bold">
              <a
                className={cn({ 'is-active': selectedUserId === 0 })}
                data-cy="FilterAllUsers"
                href="#/"
                onClick={() => handleSelectUser(0)}
              >
                All
              </a>
              {usersFromServer.map(user => (
                <a
                  data-cy="FilterUser"
                  href="#/"
                  className={cn({ 'is-active': selectedUserId === user.id })}
                  onClick={() => handleSelectUser(user.id)}
                >
                  {user.name}
                </a>
              ))}

            </p>

            <div className="panel-block">
              <p className="control has-icons-left has-icons-right">
                <input
                  data-cy="SearchField"
                  type="text"
                  className="input"
                  placeholder="Search"
                  value="qwe"
                />

                <span className="icon is-left">
                  <i className="fas fa-search" aria-hidden="true" />
                </span>

                <span className="icon is-right">
                  {/* eslint-disable-next-line jsx-a11y/control-has-associated-label */}
                  <button
                    data-cy="ClearButton"
                    type="button"
                    className="delete"
                  />
                </span>
              </p>
            </div>

            <div className="panel-block is-flex-wrap-wrap">
              <a
                href="#/"
                data-cy="AllCategories"
                className="button is-success mr-6 is-outlined"
              >
                All
              </a>

              {categoriesFromServer.map(category => (
                <a
                  data-cy="Category"
                  className="button mr-2 my-1 is-info"
                  href="#/"
                >
                  {category.title}
                </a>
              ))}
            </div>

            <div className="panel-block">
              <a
                data-cy="ResetAllButton"
                href="#/"
                className="button is-link is-outlined is-fullwidth"
              >
                Reset all filters
              </a>
            </div>
          </nav>
        </div>

        <div className="box table-container">

          <table
            data-cy="ProductTable"
            className="table is-striped is-narrow is-fullwidth"
          >
            <thead>
              <tr>
                <th>
                  <span className="is-flex is-flex-wrap-nowrap">
                    ID

                    <a href="#/">
                      <span className="icon">
                        <i data-cy="SortIcon" className="fas fa-sort" />
                      </span>
                    </a>
                  </span>
                </th>

                <th>
                  <span className="is-flex is-flex-wrap-nowrap">
                    Product

                    <a href="#/">
                      <span className="icon">
                        <i data-cy="SortIcon" className="fas fa-sort-down" />
                      </span>
                    </a>
                  </span>
                </th>

                <th>
                  <span className="is-flex is-flex-wrap-nowrap">
                    Category

                    <a href="#/">
                      <span className="icon">
                        <i data-cy="SortIcon" className="fas fa-sort-up" />
                      </span>
                    </a>
                  </span>
                </th>

                <th>
                  <span className="is-flex is-flex-wrap-nowrap">
                    User

                    <a href="#/">
                      <span className="icon">
                        <i data-cy="SortIcon" className="fas fa-sort" />
                      </span>
                    </a>
                  </span>
                </th>
              </tr>
            </thead>

            <tbody>
              {preparedProducts.length ? (preparedProducts.map(product => {
                const { name, category, id } = product;

                return (
                  <tr data-cy="Product">
                    <td className="has-text-weight-bold" data-cy="ProductId">
                      {id}
                    </td>

                    <td data-cy="ProductName">{name}</td>
                    <td data-cy="ProductCategory">
                      {category?.icon}
                      {` - ${category?.title}`}
                    </td>

                    <td
                      data-cy="ProductUser"
                      className={cn({
                        'has-text-link': category?.user?.sex === 'm',
                        'has-text-danger': category?.user?.sex === 'f',
                      })}
                    >
                      {category?.user?.name}
                    </td>
                  </tr>
                );
              })) : (
                <p data-cy="NoMatchingMessage">
                  No products matching selected criteria
                </p>
              )}

            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
};
