/* eslint-disable jsx-a11y/control-has-associated-label */
import React, { useState } from 'react';
import './App.scss';

import cn from 'classnames';
import usersFromServer from './api/users';
import productsFromServer from './api/products';
import categoriesFromServer from './api/categories';
import { SortLink } from './SortLink';

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
 };

 type Product = {
   id: number;
   name: string;
   categoryId: number;
   user: User | null;
   category: Category | null;
 };

const getUserById = (ownerId: number) => usersFromServer
  .find(user => user.id === ownerId)
|| null;

const getCategoryById = (categoryId: number) => categoriesFromServer
  .find(category => category.id === categoryId) || null;

const products:Product[] = productsFromServer.map(product => {
  const category = getCategoryById(product.categoryId);
  const user = getUserById(category?.ownerId || 0);

  return {
    ...product,
    category,
    user,
  };
});

const sortProducts = (
  productstoSort: Product[],
  sortField: keyof Product,
  isReversed: boolean,
): Product[] => {
  const sortedProducts = [...productstoSort];

  if (sortField) {
    sortedProducts.sort((product1, product2) => {
      switch (sortField) {
        case 'id':
          return Number(product1.id) - Number(product2.id);

        case 'name':
          return product1.name.localeCompare(product2.name);

        case 'category':
          return (product1.category?.title || '')
            .localeCompare(product2.category?.title || '');

        case 'user':
          return (product1.user?.name || '')
            .localeCompare(product2.user?.name || '');

        default:
          return 0;
      }
    });
  }

  return isReversed
    ? sortedProducts.reverse()
    : sortedProducts;
};

export const App: React.FC = () => {
  const [selectedUserId, setSelectedUserId] = useState(0);
  const [query, setQuery] = useState('');
  const [selectedCategories, setSelectedCategories] = useState<Category[]>([]);
  const [sortField, setSortField] = useState<keyof Product | null>(null);
  const [isReversed, setIsReversed] = useState(false);

  const isCategorySelected = (categoryToCheck: Category) => {
    return selectedCategories.some(
      category => category.id === categoryToCheck.id,
    );
  };

  const handleCategorySelect = (categoryToHandle: Category) => {
    if (isCategorySelected(categoryToHandle)) {
      setSelectedCategories(current => current.filter(
        category => category.id !== categoryToHandle.id,
      ));
    } else {
      setSelectedCategories(current => [...current, categoryToHandle]);
    }
  };

  const handleResetAllFilter = () => {
    setSelectedUserId(0);
    setQuery('');
    setSelectedCategories([]);
  };

  const sortBy = (field: keyof Product) => {
    if (field !== sortField) {
      setSortField(field);
      setIsReversed(false);

      return;
    }

    if (!isReversed) {
      setIsReversed(true);

      return;
    }

    setSortField(null);
    setIsReversed(false);
  };

  let visibleProducts = [...products];

  if (selectedUserId) {
    visibleProducts = visibleProducts.filter(
      product => product.user?.id === selectedUserId,
    );
  }

  if (query) {
    const lowerQuery = query.toLowerCase();

    visibleProducts = visibleProducts.filter(
      product => product.name.toLowerCase().includes(lowerQuery),
    );
  }

  if (selectedCategories.length) {
    visibleProducts = visibleProducts.filter(product => selectedCategories
      .some(category => category.id === product.categoryId));
  }

  if (sortField) {
    visibleProducts = sortProducts(visibleProducts, sortField, isReversed);
  }

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
                onClick={() => setSelectedUserId(0)}
              >
                All
              </a>
              {usersFromServer.map(user => (
                <a
                  key={user.id}
                  data-cy="FilterUser"
                  href="#/"
                  className={cn({ 'is-active': selectedUserId === user.id })}
                  onClick={() => setSelectedUserId(user.id)}
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
                  value={query}
                  onChange={event => {
                    setQuery(event.target.value);
                  }}
                />

                <span className="icon is-left">
                  <i className="fas fa-search" aria-hidden="true" />
                </span>

                <span className="icon is-right">
                  {query && (
                    <button
                      data-cy="ClearButton"
                      type="button"
                      className="delete"
                      onClick={() => setQuery('')}
                    />
                  )}
                </span>
              </p>
            </div>

            <div className="panel-block is-flex-wrap-wrap">
              <a
                href="#/"
                data-cy="AllCategories"
                className={cn('button is-success mr-6', {
                  'is-outlined': selectedCategories.length !== 0,
                })}
                onClick={() => setSelectedCategories([])}
              >
                All
              </a>

              {categoriesFromServer.map(category => (
                <a
                  key={category.id}
                  data-cy="Category"
                  className={cn('button mr-2 my-1', {
                    'is-info': isCategorySelected(category),
                  })}
                  href="#/"
                  onClick={() => handleCategorySelect(category)}
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
                onClick={handleResetAllFilter}
              >
                Reset all filters
              </a>
            </div>
          </nav>
        </div>

        {visibleProducts.length ? (
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
                      <SortLink
                        onClick={() => sortBy('id')}
                        isActive={sortField === 'id'}
                        isReversed={isReversed}
                      />
                    </span>
                  </th>
                  <th>
                    <span className="is-flex is-flex-wrap-nowrap">
                      Product
                      <SortLink
                        onClick={() => sortBy('name')}
                        isActive={sortField === 'name'}
                        isReversed={isReversed}
                      />
                    </span>
                  </th>
                  <th>
                    <span className="is-flex is-flex-wrap-nowrap">
                      Category
                      <SortLink
                        onClick={() => sortBy('category')}
                        isActive={sortField === 'category'}
                        isReversed={isReversed}
                      />
                    </span>
                  </th>
                  <th>
                    <span className="is-flex is-flex-wrap-nowrap">
                      User
                      <SortLink
                        onClick={() => sortBy('user')}
                        isActive={sortField === 'user'}
                        isReversed={isReversed}
                      />
                    </span>
                  </th>
                </tr>
              </thead>
              <tbody>
                {visibleProducts.map(product => {
                  const {
                    name, category, id, user,
                  } = product;

                  return (
                    <tr
                      data-cy="Product"
                      key={product.id}
                    >
                      <td
                        className="has-text-weight-bold"
                        data-cy="ProductId"
                      >
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
                          'has-text-link': user?.sex === 'm',
                          'has-text-danger': user?.sex === 'f',
                        })}
                      >
                        {user?.name}
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        ) : (
          <p
            data-cy="NoMatchingMessage"
          >
            No products matching selected criteria
          </p>
        )}
      </div>
    </div>
  );
};
