using Microsoft.EntityFrameworkCore;
using MultiShop.Comment.Entities;

namespace MultiShop.Comment.Context
{
    public class CommentContext : DbContext
    {
        protected override void OnConfiguring(DbContextOptionsBuilder optionsBuilder)
        {
            optionsBuilder.UseSqlServer("Server=localhost,1442;Initial Catalog=MultiShopCommentDb;User Id=sa;Password=123456aA*;TrustServerCertificate=True;");
        }

        public DbSet<UserComment> UserComments { get; set; }
    }
}
