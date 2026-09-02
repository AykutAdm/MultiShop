using MultiShop.Order.Application.Features.CQRS.Commands.AddressCommands;
using MultiShop.Order.Application.Interfaces;
using MultiShop.Order.Domain.Entities;
using System;
using System.Collections.Generic;
using System.Linq;
using System.Text;
using System.Threading.Tasks;

namespace MultiShop.Order.Application.Features.CQRS.Handlers.AddressHandlers
{
    public class UpdateAddressCommandHandler
    {
        private readonly IRepository<Address> _repository;

        public UpdateAddressCommandHandler(IRepository<Address> repository)
        {
            _repository = repository;
        }

        public async Task Handle(UpdateAddressCommand command)
        {
            var values = await _repository.GetByIdAsync(command.AddressId);
            values.Detail1 = command.Detail1;
            values.District = command.District;
            values.City = command.City;
            values.UserId = command.UserId;
            values.Country = command.Country;
            values.Surname = command.Surname;
            values.Phone = command.Phone;
            values.Detail2 = command.Detail2;
            values.ZipCode = command.ZipCode;
            values.Name = command.Name;
            values.Description = command.Description;
            values.AddressId = command.AddressId;
            values.Email = command.Email;

            await _repository.UpdateAsync(values);
        }
    }
}
